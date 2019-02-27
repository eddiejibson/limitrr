# .getIp()

> Express middleware function to get the real IP of the user, even if your applicaiton is behind Cloudflare.

Whilst limitrr uses an internal function internally to get the correct IP via the request headers, we've also made this function available for easy access. Note that obviously this function is not required for limitrr to work with IPs.

On the call of this function, it will add the user's real IP to the `request (req)` object under the keyname `realIp` `(req.realIp)`.

## Examples
```javascript
//For your whole express application/router, you can use this:
//(Doing this is reccomended as it is not intensive and will mean the value can
//be accessed globally throughout your application)
app.use(limitrr.getIp());
//As for route specific usage:
app.get('/', limitrr.getIp(), (req, res, next) => {
    res.send(`Hello, you have the IP ${req.realIp}`);
});
```
