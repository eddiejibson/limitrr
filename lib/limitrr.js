/*
 * @Project: limitrr
 * @Created Date: Wednesday, October 31st 2018, 2:42:59 pm
 * @Author: Edward Jibson
 * @Last Modified Time: November 13th 2018, 7:55:44 pm
 * @Last Modified By: Edward Jibson
 */
const Redis = require("ioredis");

class limitrr {
    constructor(conf) {
        conf.routes = conf.routes || {};
        conf.routes.default = conf.routes.default || {};
        conf.routes.errorMsgs = conf.routes.errorMsgs || {};
        //So many ors because compatibility with version 1
        conf.routes.default = {
            "requestsPerExpiry": conf.routes.default.requestsPerExpiry || conf.options.requestsPerExpiry || 100,
            "completedActionsPerExpiry": conf.routes.default.completedActionsPerExpiry || conf.options.completedActionsPerExpiry || 5,
            "expiry": conf.routes.default.expiry || conf.options.expiry || 900,
            "completedExpiry": conf.routes.default.completedExpiry || conf.routes.default.expiry || conf.options.completedExpiry || conf.options.expiry || 900,
            "errorMsgs": {
                "requests": conf.routes.errorMsgs.requests || conf.options.errorMsg || "As you have made too many requests, you are being rate limited.",
                "completed": conf.routes.errorMsgs.completed || conf.options.errorMsg || "As you performed too many successful actions, you are being rate limited."
            }
        };
        this.options = {
            //Use provided options or if not, revert to default.
            keyName: conf.options.keyName || "limitrr",
            errorStatusCode: conf.options.errorStatusCode || 429,
            catchErrors: conf.options.catchErrors || true
        };

        this.routes = conf.routes;

        this.db = new Redis({
            port: conf.redis.port || 6379,
            host: conf.redis.host || "127.0.0.1",
            family: conf.redis.family || 4,
            password: conf.redis.password || "",
            db: conf.redis.db || 0
        });
        this.db.on("error", ((err) => {
            if (this.options.catchErrors) {
                console.error("[limitrr] Couldn't connect to redis:", err);
            } else {
                throw new Error(err);
            }
        }));
    }

    getIp() {
        return (req, res, next) => {
            req.realIp =
                req.headers["cf-connecting-ip"] ||
                req.headers["x-forwarded-for"] ||
                req.connection.remoteAddress;
            next();
        };
    }

    limit(route = "default") {
        return (req, res, next) => {
            let ip =
                req.headers["cf-connecting-ip"] ||
                req.headers["x-forwarded-for"] ||
                req.connection.remoteAddress;
            this.db.multi()
                .get(`limitrr:${this.options.keyName}:${ip}:${route}:requests`)
                .get(`limitrr:${this.options.keyName}:${ip}:${route}:completed`)
                .ttl(`limitrr:${this.options.keyName}:${ip}:${route}:requests`)
                .ttl(`limitrr:${this.options.keyName}:${ip}:${route}:completed`)
                .exec()
                .then((result) => {
                    let errorMsgs = this.routes[route].errorMsgs || {};
                    this.routes[route] = this.routes[route] || this.routes.default;
                    if (result[2][1] < 0) {
                        result[2][1] = 0;
                    }
                    if (result[3][1] < 0) {
                        result[3][1] = 0;
                    }
                    res.header("X-RateLimit-Limit", (this.routes[route].requestsPerExpiry || this.routes.default.requestsPerExpiry));
                    res.header("X-RateLimit-Remaining", ((this.routes[route].requestsPerExpiry || this.routes.default.requestsPerExpiry) - result[0][1]));
                    res.header("X-RateLimit-Reset", result[2][1]);
                    res.header("X-RateLimit-Limit-Actions", (this.routes[route].completedActionsPerExpiry || this.routes.default.completedActionsPerExpiry));
                    res.header("X-RateLimit-Remaining-Actions", ((this.routes[route].completedActionsPerExpiry || this.routes.default.completedActionsPerExpiry) - result[1][1]));
                    res.header("X-RateLimit-Reset-Actions", result[3][1]);
                    if (result[0][1] >= (this.routes[route].requestsPerExpiry || this.routes.default.requestsPerExpiry)) {
                        return res.status(this.options.errorStatusCode).json({
                            error: errorMsgs.requests || this.routes.default.errorMsgs.requests
                        });
                    } else if (result[1][1] >= (this.routes[route].completedActionsPerExpiry || this.routes.default.completedActionsPerExpiry)) {
                        return res.status(this.options.errorStatusCode).json({
                            error: errorMsgs.completed || this.routes[route].errorMsgs.requests || this.routes.default.errorMsgs.completed
                        });
                    } else if (result[0][1]) {
                        this.db.incr(`limitrr:${this.options.keyName}:${ip}:${route}:requests`).then((result) => {
                            next();
                        }).catch((err) => {
                            this._handleError(err, res);
                        });
                    } else {
                        this.db
                            .multi()
                            .incr(`limitrr:${this.options.keyName}:${ip}:${route}:requests`)
                            .expire(
                                `limitrr:${this.options.keyName}:${ip}:${route}:requests`,
                                (this.routes[route].expiry || this.routes.default.expiry)
                            )
                            .exec()
                            .then((result) => {
                                next();
                            })
                            .catch((err) => {
                                this._handleError(err, res);
                            });
                    }
                })
                .catch((err) => {
                    this._handleError(err, res);
                });
        };
    }

    complete(discriminator, route = "default") {
        return new Promise((resolve, reject) => {
            this.routes[route] = this.routes[route] || this.routes.default;
            this.db
                .multi()
                .incr(
                    `limitrr:${this.options.keyName}:${discriminator}:${route}:completed`
                )
                .expire(
                    `limitrr:${this.options.keyName}:${discriminator}:${route}:completed`,
                    (this.routes[route].completedExpiry || this.routes.default.completedExpiry)
                )
                .exec()
                .then((result) => {
                    if (result[1][1]) {
                        resolve(true);
                    } else {
                        reject("Keystore returned invalid data");
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    get(discriminator, route = "default") {
        return new Promise((resolve, reject) => {
            let type = false; //This used to be passed into the function. It's coming back, just not like before. This is used as a placeholder.
            if (!type) {
                this.db.multi()
                    .get(`limitrr:${this.options.keyName}:${discriminator}:${route}:requests`)
                    .get(`limitrr:${this.options.keyName}:${discriminator}:${route}:completed`)
                    .exec()
                    .then((result) => {
                        if (result) {
                            resolve({
                                "requests": result[0][1],
                                "completed": result[1][1]
                            });
                        } else {
                            reject("Keystore returned invalid data");
                        }
                    }).catch((err) => {
                        reject(err);
                    });
            } else {
                this.db.get(`limitrr:${this.options.keyName}:${discriminator}:${route}:${type}`).then((result) => {
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });
            }

        });
    }

    reset(discriminator, type = false, route = "default") {
        return new Promise((resolve, reject) => {
            if (!type) {
                this.db.multi()
                    .del(`limitrr:${this.options.keyName}:${discriminator}:${route}:requests`)
                    .del(`limitrr:${this.options.keyName}:${discriminator}:${route}:completed`)
                    .exec().then((result) => {
                        if (result[0][1] && result[1][1]) {
                            resolve(true);
                        } else {
                            reject("Keystore returned invalid data");
                        }
                    }).catch((err) => {
                        reject(err);
                    });
            } else {
                this.db.del(`limitrr:${this.options.keyName}:${discriminator}:${route}:${type}`).then((result) => {
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });
            }

        });
    }

    _handleError(err, res = false) {
        if (this.options.catchErrors) {
            console.error("[limitrr] Error:", err);
        } else {
            throw new Error(err);
        }
        return res.status(500).json({
            error: "Internal Error"
        });
    }


}

module.exports = limitrr;