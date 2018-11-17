/*
 * @Project: limitrr
 * @Created Date: Thursday, November 15th 2018, 6:17:26 pm
 * @Author: Edward Jibson
 * @Last Modified Time: November 17th 2018, 7:36:52 pm
 * @Last Modified By: Edward Jibson
 * @Copyright: (c) 2018 Oxro Holdings LLC
 */

const mocha = require("mocha"),
    chai = require("chai"),
    chaiHttp = require("chai-http"),
    {
        expect
    } = chai,
    express = require("express"),
    app = express(),
    Limitrr = require("../lib/limitrr");

const redisObj = {
    "password": process.env.REDIS_PASSWORD || "",
    "host": process.env.REDIS_HOST || "127.0.0.1",
    "port": process.env.REDIS_PORT || 6379,
    "family": process.env.REDIS_FAMILY || 4
};

const limitrr = new Limitrr({
    "redis": redisObj,
    "options": {},
    "routes": {
        "full": {
            "requestsPerExpiry": 300
        },
        "two": {
            "requestsPerExpiry": 1,
            "keyName": "limitrrTest"
        },
        "empty": {}
    }
});

limitrr.reset({
    "route": "two",
    "discriminator": "test"
});

app.get('/', limitrr.limit({
    "route": "two",
    "test": true
}), (req, res, next) => {
    res.status(200).json({
        "pass": true
    });
});

app.use(limitrr.getIp());

chai.use(chaiHttp);


describe("Limitrr object test", () => {
    // it("Should have connected to Redis", (done) => {
    //     let isConnected = limitrr.getConnection()
    //     expect(isConnected).to.be.true;
    //     done();
    // });
    it("Set empty options to correct default properties", (done) => {
        let options = limitrr.getOptions();
        expect(options).to.be.a("object");
        expect(options).to.have.keys(["keyName", "errorStatusCode", "catchErrors"])
        expect(options.keyName).to.equal("limitrr");
        expect(options.errorStatusCode).to.equal(429);
        expect(options.catchErrors).to.be.true;
        done();
    });
    it("Set empty route to correct default properties", (done) => {
        let routes = limitrr.getRoutes();
        expect(routes).to.be.a("object");
        expect(routes.empty).to.have.keys(["requestsPerExpiry", "completedActionsPerExpiry", "expiry", "completedExpiry", "errorMsgs"])
        expect(routes.empty.requestsPerExpiry).to.equal(100);
        expect(routes.empty.completedActionsPerExpiry).to.equal(5);
        expect(routes.empty.expiry).to.equal(900);
        expect(routes.empty.completedExpiry).to.equal(900);
        expect(routes.empty.errorMsgs).to.be.a("object");
        expect(routes.empty.errorMsgs.requests).to.equal("As you have made too many requests, you are being rate limited.");
        expect(routes.empty.errorMsgs.completed).to.equal("As you performed too many successful actions, you are being rate limited.");
        done();
    });
});

describe("limit()", () => {
    it("Should send valid response when not being limited", (done) => {
        chai.request(app).get("/").end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a("object");
            expect(res.body.pass).to.be.true;
            expect(res.headers).to.be.a("object");
            expect(res.headers["x-ratelimit-limit"]).to.equal("1");
            expect(res.headers["x-ratelimit-remaining"]).to.equal("0");
            done();
        });
    });
    it("Should send valid response when being rate limited", (done) => {
        chai.request(app).get("/").end((err, res) => {
            expect(res).to.have.status(429);
            expect(res.body).to.be.a("object");
            expect(res.body.error).to.equal("As you have made too many requests, you are being rate limited.")
            done();
        });
    });
});

describe("get() and reset()", () => {
    it("Should get correct values", () => {
        return limitrr.get("test", "two").then((res) => { //Testing compatibility with old way of passing in values to function
            expect(res).to.be.a("object");
            expect(res.requests).to.be.a("number");
            expect(res.requests).to.equal(1);
            expect(res.completed).to.be.a("number");
            expect(res.completed).to.equal(0);
        });
    });
    it("Should return true when resetting values successfully", () => {
        return limitrr.reset({
            "discriminator": "test",
            "route": "two"
        }).then((res) => {
            expect(res).to.be.true;
        });
    });
    it("Should have reset values correctly", () => {
        return limitrr.get({
            "discriminator": "test",
            "route": "two"
        }).then((res) => { //Testing compatibility with old way of passing in values to function
            expect(res).to.be.a("object");
            expect(res.requests).to.be.a("number");
            expect(res.requests).to.equal(0);
            expect(res.completed).to.be.a("number");
            expect(res.completed).to.equal(0);
        });
    });
});

describe("complete()", () => {
    it("Should return true when incrementing completed actions count successfully", () => {
        return limitrr.complete("test", "two").then((res) => {
            expect(res).to.be.true;
        });
    });
});

describe("get() and reset() with more parameters", () => {
    it("Should return correct completed action count", () => {
        return limitrr.get({
            "discriminator": "test",
            "route": "two",
            "type": "completed"
        }).then((res) => {
            expect(res).to.be.a("number");
            expect(res).to.equal(1);
        });
    });
    it("Should return true when resetting one value successfully", () => {
        return limitrr.reset("test", "completed", "two").then((res) => {
            expect(res).to.be.true;
        });
    });
    it("Should return correct completed action count on reset", () => {
        return limitrr.get({
            "discriminator": "test",
            "route": "two",
            "type": "completed"
        }).then((res) => {
            expect(res).to.be.a("number");
            expect(res).to.equal(0);
        });
    });
})
