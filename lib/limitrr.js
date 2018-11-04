/*
 * @Project: limitrr
 * @Created Date: Wednesday, October 31st 2018, 2:42:59 pm
 * @Author: Edward Jibson
 * @Last Modified Time: November 4th 2018, 12:29:50 am
 * @Last Modified By: Edward Jibson
 */
const Redis = require("ioredis");

class limitrr {
    constructor(conf) {
        if (conf.redis) {
            this.options = { //Use provided options or if not, revert to default.
                "keyName": conf.options.keyName || "limitrr",
                "requestsPerExpiry": conf.options.requestsPerExpiry || 100,
                "completedActionsPerExpiry": conf.options.completedActionsPerExpiry || 5,
                "expiry": conf.options.expiry || 900,
                "completedExpiry": conf.options.completedExpiry || conf.options.expiry || 900,
                "errorMsg": conf.options.errorMsg || "You are being rate limited",
                "errorStatusCode": conf.options.errorStatusCode || 429,
                "catchErrors": conf.options.catchErrors || true
            }
            this.db = new Redis({
                port: conf.redis.port,
                host: conf.redis.host,
                family: conf.redis.family,
                password: conf.redis.password,
                db: 1
            });
            this.db.on("error", (err) => {
                if (this.options.catchErrors) {
                    console.error(`[limitrr] Couldn't connect to redis:`, err)
                } else {
                    throw new Error(err);
                }
            });
        }
    }

    getIp() {
        return ((req, res, next) => {
            req.ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            next();
        });
    }

    limit(route = "default") {
        return ((req, res, next) => {
            let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            this.db.get(`limitrr:${this.options.keyName}:${ip}:${route}:requests`).then((result) => { //Also get competed actions
                if (result >= conf.requestsPerExpiry) {
                    return res.status(this.options.errorStatusCode).json({
                        "error": this.options.errorMsg
                    });
                } else {
                    this.db.multi()
                        .incr(`limitrr:${this.options.keyName}:${ip}:${route}:requests`)
                        .expire(`limirr:${this.options.keyName}:${ip}:${route}:requests`, this.options.expiry)
                        .exec()
                        .then((result) => {
                            next();
                        }).catch((err) => {
                            if (this.options.catchErrors) {
                                console.error(`[limitrr] Error:`, err);
                            } else {
                                throw new Error(err);
                            }
                            return res.status(500).json({
                                error: `There was an error processing your request`,
                                errorId: id
                            });
                        });
                }
            }).catch((err) => {
                if (this.options.catchErrors) {
                    console.error(`[limitrr] Error:`, err);
                } else {
                    throw new Error(err);
                }
                return res.status(500).json({
                    "error": "Internal Error"
                });
            });
        });
    }

    complete(discriminator, route = "default") {
        return new Promise((resolve, reject) => {
            this.db.multi()
                .incr(`limitrr:${this.options.keyName}:${discriminator}:${route}:completed`)
                .expire(`limitrr:${this.options.keyName}:${discriminator}:${route}:completed`, this.options.completedExpiry).exec().then((result) => {
                    if (result[1][1]) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }).catch((err) => {
                    reject(err);
                });
        });
    }

    get(discriminator, type = "completed", route = "default") {
        return new Promise((resolve, reject) => {
            this.db.get(`limitrr:${this.options.keyName}:${discriminator}:${route}:${type}`).then((result) => {
                resolve(result);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    reset(discriminator, type = "completed", route = "default") {
        return new Promise((resolve, reject) => {
            this.db.del(`limitrr:${this.options.keyName}:${discriminator}:${route}:${type}`).then((result) => {
                resolve(result);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    resetAll(discriminator, route = "default") {
        return new Promise((resolve, reject) => {
            this.db.multi()
                .del(`limitrr:${this.options.keyName}:${discriminator}:${route}:completed`)
                .del(`limitrr:${this.options.keyName}:${discriminator}:${route}:requests`).then((result) => {
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });
        });
    }

}

module.exports = limitrr;