# .limit()

> Express Middleware function to rate-limit your web application

*The following function will increase request values only (as simply making a request isn't intensive). But, if you want to increase both request and completed values, see the [.incr page](incr.md).*

``` javascript
limitrr.limit({
    route: route //Not required
});
```
This function is specifically for easily increasing the request count - assuming the discriminator to be the user's IP address which is retrieved via an internal limitrr function. It will even get the correct IP if your application is behind Cloudflare.

## Examples
```javascript
//For your whole express application/router, you can use this:
app.use(limitrr.limit({route: "default"}));
//As for route specific usage:
app.get('/', limitrr.limit({route: "home"}), (req, res, next) => {
    res.send('Hello World!')
});
```

**Further reading:** [Headers](headers.md)