# .get()

> Get the value of a certain key

**Returns**: Promise

``` javascript
limitrr.get({
    discriminator: discriminator, //Required
    route: route, //Not required
    type: type //Not required
});
```

## Parameters

*Must be passed into function via object*

- **discriminator**: **Required** Where discriminator is the thing being limited (e.g x amount of completed actions/requests per discriminator)
- **route**: *String* What route should the values be retrieved from? If this is not set, it will get the counts from the default route.
- **type**: *String* Instead of retrieving both values, you can specify either `requests` or `completed` in this key and only that will be returned as an integer.

## Examples

```javascript
limitrr.get({
    discriminator: discriminator,
    route: route
    type: type
}); //Besides discriminator, all parameters are optional.
//If type is not passed into the function, it will
//return both the amount of requests and completed actions

//Where discriminator is the thing being limited
//e.g x amount of completed actions/requests per discriminator
limitrr.get({discriminator: discriminator});

//This tends to be the user's IP.
limitrr.get({discriminator: req.realIp})
//This will return both the amount of requests and completed actions stored under the
//discriminator provided in an object. You can handle like this:
let result = await limitrr.get({discriminator: req.realIp}).catch((err) => {
    //Handle error
});
console.log(`${result.requests} Requests`);
console.log(`${result.completed} Completed Tasks`);

//The above example would get the request and completed task count from the default
//route. If you would like to retrieve values from a different route, you can specify
//this as well. It can be done like this (This time we'll use pure promises instead of async/await):
limitrr.get({
    discriminator: req.realIp,
    route: "exampleRouteName"
}).then((result) => {
    console.log(`${result.requests} Requests made through the route exampleRouteName`);
    console.log(`${result.completed} Completed Tasks made through the route exampleRouteName`);
}).catch((err) => {
    //Handle error
});
```