/*
 * @Project: limitr
 * @Created Date: Wednesday, October 31st 2018, 2:42:59 pm
 * @Author: Edward Jibson
 * @Last Modified Time: November 3rd 2018, 7:46:21 pm
 * @Last Modified By: Edward Jibson
 */
const Redis = require("ioredis");

class limitr {
    constructor(conf) {
        if (conf.redis) {
            this.options = { //Use provided options or if not, revert to default.
                "keyName": conf.options.keyName || "limitr",
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
                    console.error(`[limitr] Couldn't connect to redis:`, err)
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
            this.db.get(`limitr:${this.options.keyName}:${ip}:${route}:requests`).then((result) => { //Also get competed actions
                if (result >= conf.requestsPerExpiry) {
                    return res.status(this.options.errorStatusCode).json({
                        "error": this.options.errorMsg
                    });
                } else {
                    this.db.multi()
                        .incr(`limitr:${this.options.keyName}:${ip}:${route}:requests`)
                        .expire(`limitr:${this.options.keyName}:${ip}:${route}:requests`, this.options.expiry)
                        .exec()
                        .then((result) => {
                            next();
                        }).catch((err) => {
                            if (this.options.catchErrors) {
                                console.error(`[limitr] Error:`, err);
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
                    console.error(`[limitr] Error:`, err);
                } else {
                    throw new Error(err);
                }
                return res.status(500).json({
                    "error": "Internal Error"
                });
            });
        });
    }



}

module.exports = limitr;