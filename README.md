<p align="center">
  <a href="https://github.com/eddiejibson/chae-limitrr">
    <img alt="chae" src="https://cdn.oxro.io/chae/img/limitrr.png" width="432.8" height="114.2">
  </a> </p> <p align="center">Express rate limiting using Redis.</p>

# Install

```npm install limitrr --save```

# Quick Guide

##Basic Usage

``` javascript
const express = require('express');
const app = express();
const Limitrr = require("limitrr");
const limitrr = new Limitrr({
    //Redis keystore connection information
    "redis": {
        "password": "mysupersecretpassword",
        "host": "666.chae.sh",
        "port": 6379,
        "family": 4
        //There are many more options all of which can be seen further into the documentation under the "configuration" title
    },
    //General limitrr options
    "options": {
        "expiry": 900
        //There are many more options all of which can be seen further into the documentation under the "configuration" title
    }
});

app.use(limitrr.getIp()); //Sets req.realIp to user IP - helpful later on.

//Simple rate limiting
app.get('/', limitrr.limit(), (req, res, next) => {
    res.send('Hello World!')
});

app.get("/registerUser/:user", limitrr.limit(), (req, res, next) => {
    //Non intensive actions like simple verification will have a different limit 
    //and will only be measured in terms of each request via the middleware
    if (req.params.user.length < 5) {
        //Dummy function creating user
        someRandomModule.registerUser().then((result) => {
            //Intensive actions like actually registering a user should have a different limit, hence the completedActionsPerExpiry option
            //and should only be added to once such task has been completed fully
            //In this example, we will be limiting the amount of completed actions a certain IP can make. 
            //Anything can be passed in here. For example, a email address or user ID.
            //req.realIp was determined by calling the middleware earlier - limitrr.getIp()
            limitrr.complete(req.realIp); //Calling such will complete
            //Is also a promise.
            limitrr.complete(req.realIp).then((result) => {
                return res.status(200).json({ //In this example, we will be returning a success message as the action has been completed.
                    "message": "Success!"
                });
            }).catch((err) => {
                //Do something with the caught error
            });
        });
    }
});

app.listen(port, () => console.log(`Limitrr example app listening on port ${port}!`))
```

# Configuration

## redis
Required: false

Type: Object

Redis connection information.

* **port**: Redis port. Defaults to: `6379`

* **host**: Redis hostname. Defaults to: `"127.0.0.1"`

* **family**: Is redis hostname IPv4 (4) or IPv6 (6)? Defaults to: `4`

* **password**: Redis password. Defaults to: `""`

* **db**: Redis DB. Defaults to: `0`

### Example

``` javascript
redis: {
  port: 6379, //Redis Port. Required: false. Defaults to 6379
  host: "127.0.0.1", //Redis hostname. fequired: False. Defaults to "127.0.0.1".
  family: 4, //Is redis hostname IPv4 (4) or IPv6 (6)? Required: false. Defaults to 4 (IPv4).
  password: "mysecretpassword1234", //Redis password. Required: false. Defaults to "" (empty).
  db: 0 //Redis DB. Required: false. Defaults to 0.
}
```

## options
Required: false

Type: Object

Various options to do with limitrr.

* **keyName**: The keyname all of the requests will be stored under. This is mainly for aesthetic purposes and does not effect much. However, this should be changed on each initialization of the class to prevent conflict. Defaults to: `"limitrr"`
* **requestsPerExpiry**: How many requests can be accepted until user is rate limited? Defaults to: `100`
* **completedActionsPerExpiry**: How many completed actions can be accepted until the user is rate limited? This is useful for certain actions such as registering a user - they can have a certain amount of requests but a different (obviously smaller) amount of "completed actions". So if users have recently been successfully registered multiple times under the same IP (or other discriminator), they can be rate limited. They may be allowed 100 requests per certain expiry for general validation and such, but only a small fraction of that for intensive procedures. Defaults to the value in `requestsPerExpiry` or `5` if such is not set.
* **expiry**: How long should the requests be stored (in seconds) before they are set back to 0? If set to -1, such values will never expire and will stay that way indefinitely or must be manually removed. Defaults to: `900` (15 minutes)
* **completedExpiry**: How long should the "completed actions" (such as the amount of users registered from such an IP or other discriminator) be stored for (in seconds) before set back to 0? If set to -1, such values will never expire and will stay that way indefinitely or must be manually removed. Defaults to the value in `expiry` or `900` (15 minutes) if such is not set.
* **errorMsg**: Error message to return when the user is being rate limited. Defaults to: `You are being rate limited`
* **errorStatusCode**: Status code to return when the user is being rate limited. Defaults to `429` (Too Many Requests)
* **catchErrors**: Should important errors such as failure to connect to the Redis keystore be caught and displayed? If this is not set to true, it will simply throw an error instead. Defaults to `true`.

### Example

``` javascript
options: {
  keyName: "myApp", //The keyname all of the requests will be stored under. Required: false. Defaults to "limitrr"
  requestsPerExpiry: 100, //How many requests can be accepted until user is rate limited?. Required: false. Defaults to 100.
  completedActionsPerExpiry: 5, //Is redis hostname IPv4 (4) or IPv6 (6)? Required: false. Defaults to 4 (IPv4).
  expiry: 900, //How long should the requests be stored (in seconds). Required: False. Defaults to 900.
  completedExpiry: 900, //How long should the "completed actions" be stored (in seconds). Required: false. Defaults to the value in expiry or 900 if such is not set
  errorMsg: "You are being rate limited", //Error message to return when user is being rate limited. Required: false. Defaults to: "You are being rate limited"
  errorStatusCode: 429, //Status code to return when the user is being rate limited. Defaults to: 429 (Too many requests)
  catchErrors: true //Should important errors such as failure to connect to the Redis keystore be caught and displayed?
}
```