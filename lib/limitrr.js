/*
 * @Project: limitrr
 * @Author: Edward Jibson
 */
const Redis = require("ioredis");

class limitrr {
    constructor(conf = {}) {
        conf.routes = conf.routes || {};
        conf.options = conf.options || {};
        conf.redis = conf.redis || {};
        conf.routes.default = conf.routes.default || {};
        conf.routes.default.errorMsgs = conf.routes.default.errorMsgs || {};
        //So many ors because compatibility with version 1
        conf.routes.default = {
            "requestsPerExpiry": conf.routes.default.requestsPerExpiry || conf.options.requestsPerExpiry || 100,
            "completedActionsPerExpiry": conf.routes.default.completedActionsPerExpiry || conf.options.completedActionsPerExpiry || 5,
            "expiry": conf.routes.default.expiry || conf.options.expiry || 900,
            "completedExpiry": conf.routes.default.completedExpiry || conf.routes.default.expiry || conf.options.completedExpiry || conf.options.expiry || 900,
            "errorMsgs": {
                "requests": conf.routes.default.errorMsgs.requests || conf.options.errorMsg || "As you have made too many requests, you are being rate limited.",
                "completed": conf.routes.default.errorMsgs.completed || conf.options.errorMsg || "As you performed too many successful actions, you are being rate limited."
            }
        };

        this.options = {
            keyName: conf.options.keyName || "limitrr",
            errorStatusCode: conf.options.errorStatusCode || 429,
            catchErrors: conf.options.catchErrors || true
        };

        this.routes = conf.routes;
        this.routes = this._setDefaultToUndefined(this.routes)
        let redis = null;
        if (conf.redis != null && typeof conf.redis == "string") {
            redis = conf.redis;
        } else {
            redis = {
                port: conf.redis.port || 6379,
                host: conf.redis.host || "127.0.0.1",
                family: conf.redis.family || 4,
                password: conf.redis.password || "",
                db: conf.redis.db || 0
            }
        }
        this.db = new Redis(redis);
        this.db.on("error", (err) => {
            if (this.options.catchErrors) {
                this.isConnected = false;
                console.error("[limitrr] Couldn't connect to redis:", err.message);
            } else {
                throw new Error(err);
            }
        });
    }

    getRoutes() {
        return this.routes;
    }

    getOptions() {
        return this.options;
    }

    getIp() {
        return (req, res, next) => {
            req.realIp = this._resolveIpAddress(req);
            next();
        };
    }

    limit(obj = {
        "route": "default",
        "discriminator": null,
        "fromReq": []
    }) {
        return async (req, res, next) => {
            let route;
            if (typeof obj === "string") {
                route = obj;
            } else {
                route = obj.route;
            }
            let {
                test, discriminator, fromReq
            } = obj;
            if (fromReq && Array.isArray(fromReq) && fromReq.length > 0) {
                discriminator = this._getFromReq(fromReq, req);
            }
            if (!discriminator) {
                discriminator = this._resolveIpAddress(req);
            }
            if (test) {
                discriminator = "test";
            }
            let key = `limitrr:${this.options.keyName}:${discriminator}:${route}`;
            let result = await this.db.multi().get(`${key}:requests`).get(`${key}:completed`).ttl(`${key}:requests`).ttl(`${key}:completed`).exec().catch((err) => {
                next(err);
            });
            this.routes[route] = this.routes[route] || this.routes.default;
            if (result[2][1] < 0) {
                result[2][1] = 0;
            }
            if (result[3][1] < 0) {
                result[3][1] = 0;
            }
            res.header("X-RateLimit-Limit", this.routes[route].requestsPerExpiry);
            res.header("X-RateLimit-Remaining", (this.routes[route].requestsPerExpiry - result[0][1] - 1));
            res.header("X-RateLimit-resultet", parseInt(result[2][1]));
            res.header("X-RateLimit-Limit-Actions", this.routes[route].completedActionsPerExpiry);
            res.header("X-RateLimit-Remaining-Actions", (this.routes[route].completedActionsPerExpiry - result[1][1]));
            res.header("X-RateLimit-Reset-Actions", parseInt(result[3][1]));
            if (parseInt(result[0][1]) >= this.routes[route].requestsPerExpiry) {
                return result.status(this.options.errorStatusCode).json({
                    error: this.routes[route].errorMsgs.requests
                });
            } else if (parseInt(result[1][1]) >= this.routes[route].completedActionsPerExpiry) {
                return result.status(this.options.errorStatusCode).json({
                    error: this.routes[route].errorMsgs.completed
                });
            } else if (result[0][1]) {
                let result = await this.db.incr(`${key}:requests`).catch((err) => {
                    next(err);
                });
                if (result > 0) {
                    next();
                } else {
                    next("Keystore returned invalid data");
                }
            } else {
                let result = await this.db.multi().incr(`${key}:requests`).expire(`${key}:requests`, this.routes[route].expiry).exec().catch((err) => {
                    next(err);
                });
                if (result.length > 0) {
                    next();
                } else {
                    next("Keystore returned invalid data");
                }
            }
        };
    }

    async incr(obj, o_route = "default") {
        let discriminator;
        if (typeof obj === "string") {
            discriminator = obj;
        } else {
            discriminator = obj.discriminator;
        }
        if (!discriminator && obj.req) {
            discriminator = this._resolveIpAddress(obj.req);
        }
        let { route, type } = obj;
        if (!route) {
            route = o_route;
        }
        if (!type) {
            type = "completed";
        } else {
            type = String(type).toLowerCase();
        }
        let key = `limitrr:${this.options.keyName}:${discriminator}:${route}:${type}`;
        let res = await this.db.get(key).catch((err) => {
            return Promise.reject(err);
        });
        if (res <= 0) {
            let increaseRes = await this.db.multi().incr(key).expire(key, this.routes[route].completedExpiry).exec().catch((err) => {
                return Promise.reject(err);
            });
            if (increaseRes.length > 0) {
                return Promise.resolve(res);
            } else {
                return Promise.reject("Keystore returned invalid data");
            }

        } else {
            let increaseRes = await this.db.incr(key).catch((err) => {
                return Promise.reject(err);
            });
            return Promise.resolve(increaseRes);
        }
    }

    async get(obj, o_route = "default", o_type = false) {
        let discriminator;
        if (typeof obj === "string") {
            discriminator = obj;
        } else {
            discriminator = obj.discriminator;
        }
        let {
            route,
            type
        } = obj;
        if (!route) {
            route = o_route;
        }
        if (!type) {
            type = o_type;
        }
        let key = `limitrr:${this.options.keyName}:${discriminator}:${route}`;
        if (!type) {
            let res = await this.db.multi().get(`${key}:requests`).get(`${key}:completed`).exec().catch((err) => {
                return Promise.reject(err);
            });
            if (res.length > 0) {
                return Promise.resolve({
                    "requests": (parseInt(res[0][1]) || 0),
                    "completed": (parseInt(res[1][1]) || 0)
                });
            } else {
                return Promise.reject("Keystore returned invalid data");
            }
        } else {
            type = type.toLowerCase()
            let res = await this.db.get(`${key}:${type}`).catch((err) => {
                return Promise.reject(err);
            });
            return Promise.resolve(parseInt(res) || 0);
        }
    }

    async reset(obj, o_type = false, o_route = "default") {
        let discriminator;
        if (typeof obj === "string") {
            discriminator = obj;
        } else {
            discriminator = obj.discriminator;
        }
        let {
            type,
            route
        } = obj;
        if (!type) {
            type = o_type;
        }
        if (!route) {
            route = o_route;
        }
        let key = `limitrr:${this.options.keyName}:${discriminator}:${route}`;
        if (!type) {
            let res = await this.db.multi()
                .del(`${key}:requests`)
                .del(`${key}:completed`)
                .exec().catch((err) => {
                    return Promise.reject(err);
                });
            if (res.length > 0) {
                return Promise.resolve(true);
            } else {
                return Promise.reject("Keystore returned invalid data");
            }

        } else {
            type = type.toLowerCase();
            let res = await this.db.del(`${key}:${type}`).catch((err) => {
                return Promise.reject(err);
            })
            if (res) {
                return Promise.resolve(true);
            } else {
                return Promise.reject("Keystore returned invalid data");
            }
        }
    }

    _resolveIpAddress(req) {
        return req.headers["cf-connecting-ip"] ||
            req.headers["x-forwarded-for"] ||
            req.connection.remoteAddress;
    }

    //A function pretty sure I'm the only person who uses so I won't document rn haha
    _getFromReq(fromReq, req) {
        let parent,
            key;
        if (Array.isArray(fromReq[0])) {
            for (var i = 0; i < fromReq.length; i++) {
                let el = fromReq[i];
                parent = el[1] || "body";
                key = el[0] || "username";
                if (req[parent] && req[parent][key]) {
                    return req[parent][key];
                } else if (i == (fromReq.length - 1)) {
                    return this._resolveIpAddress(req);
                }
            }
        } else {
            key = fromReq[0] || "username";
            parent = fromReq[1] || "body";
            if (req[parent] && req[parent][key]) {
                return req[parent][key]
            } else {
                return this._resolveIpAddress(req);
            }
        }
    }

    _setDefaultToUndefined(obj) {
        Object.keys(obj).forEach((obj2, index) => {
            if (index <= Object.keys(obj).length - 1) {
                obj2 = obj[obj2];
                Object.keys(this.routes.default).forEach((key) => {
                    if (!obj2[key]) {
                        obj2[key] = this.routes.default[key];
                    }
                });
            } else {
                this.routes = obj;
                return obj;
            }
        });

    }

    //DEPRECATED
    complete(obj, o_route = "default") {
        console.warn("This limitrr method is deprecated. Use incr() instead.");
        return this.incr(obj, o_route);
    }

}

module.exports = limitrr;
