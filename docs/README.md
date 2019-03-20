## limitrr

> Light NodeJS rate-limiting utilizing the Redis keystore.

Limitrr assists with the rate-limiting of various routes within your NodeJS application. Unlike other similar packages, this utility allows the user to limit not only by the number of requests but also the number of completed actions (e.g allowing a certain amount of accounts to be successfully created within a timespan) and have such restricted with custom options. As well as this, custom discriminators are possible - you no longer have to limit by just the user's IP. Included also within this package are various middleware functions for Express. However, the core functions work perfectly fine if you're not using such a package and chose to do something else, instead.

If you're finding this library of use, please consider starring it on the [GitHub repository](https://github.com/eddiejibson/limitrr). ⭐

For more details (and how to get started), visit the [Quick Start](quickstart.md) page.

For further specific documentation, navigating through the content in the Sidebar should help.

## Features

- Light and easy to use.
- Rate-limit not only by the amount of requests but the amount of successfully completed (more intensive) actions.
- Custom discriminators allowed (No need to rate-limit by just the IP).
- Custom routes within the same class instance is possible. 
- Custom rules can be set for each route.
- Forgiving (If a value is not set, a default is in place which will work effectively instead of just crashing).
- Well documented.

## Issues/Questions

If you've found any problems/bugs or if you have any questions, feel free to [open an issue on our GitHub repository](https://github.com/eddiejibson/limitrr/issues). We'll get back to you quickly. 🤞

## Donate

If Limitrr is helpful to you or your project(s), [consider donating](https://paypal.me/eddiejibson/5) to allow me to continue maintaining both this and a variety of exciting other projects. ❤️

**Next Steps:** [Quick Start](quickstart.md)
