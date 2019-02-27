# redis

**Required:** False

**Type:**: Object or String

**Description:** The Redis connection information.

***Either pass in a string containing the URI of the redis instance or an object containing the connection information:***

- **port:** *Integer* The Redis port. Defaults to: `6379`
- **host:** *String* The Redis hostname. Defaults to `"127.0.0.1"`
- **family:** *Integer* If the Redis hostname is IPv4 (4) or IPv6 (6). Defaults to: `4` (IPv4)
- **password:** *String* The Redis password. Defaults to: `""` (none)
- **db:** *Integer* The Redis Database. Defaults to: `0`

## Example

``` javascript
//Pass in a string containing a redis URI.
redis: "redis://127.0.0.1:6379/0"
//Alternatively, use an object with the connection information.
redis: {
  port: 6379, //Redis Port. Required: false. Defaults to 6379
  host: "127.0.0.1", //Redis hostname. fequired: False. Defaults to "127.0.0.1".
  family: 4, //Is redis hostname IPv4 (4) or IPv6 (6)? Required: false. Defaults to 4 (IPv4).
  password: "mysecretpassword1234", //Redis password. Required: false. Defaults to "" (empty).
  db: 0 //Redis DB. Required: false. Defaults to 0.
}
```