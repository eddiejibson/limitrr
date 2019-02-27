# options

**Required**: false

**Type**: Object

**Description**: Various options to do with Limitrr.

- **keyName**: *String* The keyname all of the requests will be stored under. This is mainly for aesthetic purposes and does not affect much. However, this should be changed on each initialization of the class to prevent conflict. Defaults to: `"limitrr"`
- **catchErrors**: *Boolean* Should important errors such as failure to connect to the Redis keystore be caught and displayed? If this is set to false, it will throw an error instead. Defaults to `true`.

## Example

``` javascript
options: {
  keyName: "myApp", //The keyname all of the requests will be stored under. Required: false. Defaults to "limitrr"
  catchErrors: true //Should important errors such as failure to connect to the Redis keystore be caught and displayed?
}
```