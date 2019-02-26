## limitrr

> Light NodeJS rate-limiting utilizing the Redis keystore.

Limitrr assists with the rate-limiting of various routes within your NodeJS application. Unlike other similar packages, this utility allows the user to limit not only by the number of requests but also the number of completed actions (e.g allowing a certain amount of accounts to be successfully created within a timespan) and have such restricted with custom options. As well as this, custom discriminators are possible - you no longer have to limit by just the user's IP. Included also within this package are various middleware functions for Express. However, the core functions work perfectly fine if you're not using such a package and chose to do something else, instead.

If you're finding this library of use, please consider starring it on the [GitHub repository](https://github.com/eddiejibson/limitrr)

For more details (and how to get started), visit the [Quick Start](quickstart.md) page.
