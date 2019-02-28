# .incr()

> Complete action/task or request count

**Returns**: Promise

```javascript
limitrr.incr({
    discriminator: discriminator, //Required
    type: type, //Not Required
    route: route //Not Required
});
```

## Parameters

*Must be passed into function via object*

- **discriminator**: **Required** Where discriminator is the thing being limited (e.g x amount of completed actions per discriminator)
- **type**: *String* Which count do you wish to be increased? `"requests"` or `"completed"`? If this is not set, this will default to `"completed"`
- **route**: *String* What route should the values be inserted into? If this is not set, it will default to `default`.

#### For ExpressJS users:

If you're unsure of the discriminator and simply want to get the user's IP from the request object, you can pass that in instead of the discriminator and limitrr will get such for you:

```javascript
limitrr.incr({
    req: req, //Either this or the discriminator key is required.
    type: type, //Not required
    route: route //Not required
})
```

## Examples

```javascript
limitrr.incr({
    discriminator: discriminator,
    route: route
    type: type
}); //Besides discriminator, all parameters are optional.
//If type is not passed into the function, it will
//assume such to be "completed"

//Where discriminator is the thing being limited
//e.g x amount of completed actions/requests per discriminator
limitrr.incr({discriminator: discriminator});

//Async example to increase the "requests" count for the discriminator 
//of "1.1.1.1" only for the route named "exampleRoute"
let result = await limitrr.incr({discriminator: "1.1.1.1", route: "exampleRoute", type: "requests"}).catch((err) => {
    //Handle error
});
//returns current (now increased) value of the key (evaluates to true) if operation was success

//"Normal" promise example to increase the "completed" count for the discriminator 
//of "1.1.1.2" only for the route named "exampleRoute2"
limitrr.incr({discriminator: "1.1.1.2", route: "exampleRoute2", type: "completed"}).then((result) => {
    //returns current (now increased) value of the key (evaluates to true) if operation was success
}).catch((err) => {
    //Handle Error
})
```