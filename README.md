<p align="center">
  <a href="https://github.com/eddiejibson/chae-limitrr">
    <img alt="chae" src="https://cdn.oxro.io/chae/img/limitrr.png" width="432.8" height="114.2">
  </a> </p> <p align="center">Express rate limiting using Redis.</p>


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
  port: 6379, //Redis Port. Required: False. Defaults to 6379
  host: "127.0.0.1", //Redis hostname. Required: False. Defaults to 127.0.0.1.
  family: 4, //Is redis hostname IPv4 (4) or IPv6 (6)? Required: False. Defaults to 4 (IPv4).
  password: "mysecretpassword1234", //Redis password. Required: False. Defaults to empty.
  db: 0 //Redis DB. Required: False. Defaults to 0.
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
* **completedExpiry**: How long should the "completed actions" (such as the amount of users registered from such an IP or other discriminator) be stored for before set back to 0? 

### 
  