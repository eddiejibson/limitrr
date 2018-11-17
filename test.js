/*
 * @Project: limitrr-example
 * @Created Date: Sunday, November 4th 2018, 8:19:05 pm
 * @Author: Edward Jibson
 * @Last Modified Time: November 14th 2018, 4:54:58 pm
 * @Last Modified By: Edward Jibson
 * @Copyright: (c) 2018 Oxro Holdings LLC
 */
const express = require('express');
const app = express();
const Limitrr = require("./lib/limitrr");
const limitrr = new Limitrr({
    //Redis keystore connection information
    "redis": {
        "password": "AZnYJ04zdPqn7lex1MCP30Hj0dvw0ydUbTPFkSeCu6fJYoj18c14ANi9MhXct5jr86XWOi2cdayBxy8wOQug83JLosdxwenVp2bpd03RwhKcWzva3WJTrMgJhLBT6bfD",
        "host": "159.69.148.73",
        "port": 6379,
        "family": 4
        //There are many more options all of which can be seen further into the documentation under the "configuration" title
    },
    //General limitrr options
    "options": {
        "expiry": 900,
        //There are many more options all of which can be seen further into the documentation under the "configuration" title
    },
    "routes": {
        //Overwrite the default options
        "default": {
            //You do not have to overwrite all the options, only the
            //ones needed.
            "requestsPerExpiry": 500
        },
        "createUser": {
            //Not all keys need to be set here either, they will resolve
            //to the default if not set.
            "requestsPerExpiry": 300
        }
    }
});

app.use(limitrr.getIp()); //Sets req.realIp to user IP - helpful later on.

//Simple rate limiting
//If route is not set
app.get('/', limitrr.limit(), (req, res, next) => {
    res.send('Hello World!')
});

//We have specified the route in the limit function this time.
app.get("/registerUser/:user", limitrr.limit("createUser"), (req, res, next) => {
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

app.listen(8089, () => console.log(`Limitrr example app listening on port 8089!`))