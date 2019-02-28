# Configuration

## Info 

Configuration is **not required** for limitrr to function. However, as it will instead assume defaults, it seems wise to have some customization (especially when connecting to your Redis keystore).

There are three different aspects of the configuration (They are lowercase as that is the exact keyname used to specify such):

- [redis (The Redis connection information.)](redis.md)

**Important Note:** The routes object has no ties to a specific web framework and is simply just how I chose to name the object where the rules would be kept. This could be used for defining rules for any type of application - regardless of it's web framework status.
- [routes (Specific route rules. For example, how long a key lasts before it becomes expired.)](routes.md)
- [options (General options to do with Limitrr. For example, the parent key name.)](options.md)

These can be passed into limitrr via an object when it is being constructed (initiated) and is done like so:

```javascript
limitrr = new Limitrr({config});
//Or, if you want it to be a bit more explicit:
limitrr = new Limitrr({
    routes: {},
    redis: {},
    options: {}
});
```