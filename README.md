<p align="center">
  <a href="https://github.com/eddiejibson/chae-limitrr">
    <img alt="chae" src="https://cdn.oxro.io/chae/img/limitrr.png" width="432.8" height="114.2">
  </a> </p> <p align="center">Express rate limiting using Redis.</p>


# Configuration

## redis
Required: false

Type: Object

Redis connection information.

### port
Required: false

Type: Integer

Default: 6379

Redis port

### host
Required: false

Type: String

Default: "127.0.0.1"

Redis hostname

### family
Required: false

Type: Integer

Default: 4

Is redis hostname IPv4 (4) or IPv6 (6)?

### password
Required: false

Type: string

Default: ""

Redis password

### db
Required: false

Type: Integer

Default: 0

Redis DB

### host

``` javascript
redis: {
  port: 6379, //Redis Port. Required: False. Defaults to 6379
  host: "127.0.0.1", //Redis hostname. Required: False. Defaults to 127.0.0.1.
  family: 4, //Is redis hostname IPv4 (4) or IPv6 (6)? Required: False. Defaults to 4 (IPv4).
  password: "mysecretpassword1234", //Redis password. Required: False. Defaults to empty.
  db: 0 //Redis DB. Required: False. Defaults to 0.
}
```

# options
Required: False

Type: Object


  