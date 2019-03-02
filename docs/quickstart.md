# Quick Start

## Installation

```bash
npm install --save limitrr
```

## Initialize

```javascript
const Limitrr = require("limitrr");
const limitrr = new Limitrr();
```

You can initialize the Limitrr class as many times as you wish, obviously.

## Examples

There are many examples of each function and how to use it within their respective pages. 

## Simple ExpressJS example

```javascript
const express = require("express");
const app = express();
const Limitrr = require("limitrr");
const limitrr = new Limitrr({
    //Redis keystore connection information
    "redis": {
        "password": "supersecret",
        "host": "666.chae.sh",
        "port": 6379,
        "family": 4
        //There are many more options all of which can be seen further into the documentation under the "configuration" title
    },
    //General limitrr options
    "options": {
        "keyName": "myApp",
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

app.use(limitrr.getIp()); //Middleware to get a user's IP - even if the application is behind Cloudflare
//This is assigned to req.realIp

//Simple rate limiting
app.get('/', limitrr.limit(), (req, res, next) => {
    res.send('Hello World!')
});

app.get("/registerUser/:user", limitrr.limit({
    "route": "createUser" //You can also pass the route name within the limitrr middleware function
    }), (req, res, next) => {
    //Non intensive actions like simple verification will have a different limit to intensive ones.
    //and will only be measured in terms of each request via the middleware.
    //No further action is required.
    if (req.params.user.length < 5) {
        //Dummy function creating user
        await someRandomModule.registerUser();
        //Intensive actions like actually registering a user should have a
        //different limit to normal requests, hence the completedActionsPerExpiry option.
        //and should only be added to once this task has been completed fully
        //In this example, we will be limiting the amount of completed actions a certain IP can make.
        //Anything can be passed in here, however. For example, a email address or user ID.
        //req.realIp was determined by calling the middleware earlier - limitrr.getIp()
        //Calling will add to the completed count
        //Bearing in mind this a promise.
        await limitrr.incr({
            discriminator: req.realIp,
            route: "createUser" //Define the route in which the count will be increased
            //If this is not set (it's not required), it defaults to the default route.
        }).catch((err) => {
            //Handle error
        });

        //In this example, we will be returning a
        //success message as the action has been completed.
        return res.status(200).json({
            "message": "Success!"
        });

    }
});

app.listen(3000, () => console.log(`Limitrr example app listening on port 3000!`));

```

**Next Steps:** [Configuration](configuration.md)


