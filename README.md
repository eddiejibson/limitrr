<div align="center">
<a href="https://github.com/eddiejibson/limitrr"><img alt="chae" src="https://github.com/eddiejibson/limitrr/raw/master/icon.png" width="487.5" height="97.3"></a>
<br>
<br>
<a href="https://circleci.com/gh/eddiejibson/limitrr"><img src="https://circleci.com/gh/eddiejibson/limitrr.svg?style=svg"></img></a>
<a href="https://www.codefactor.io/repository/github/eddiejibson/limitrr"><img src="https://www.codefactor.io/repository/github/eddiejibson/limitrr/badge"></a>
<a href="https://paypal.me/eddiejibson/5"> <img src="https://img.shields.io/badge/donate-PayPal-brightgreen.svg"></a>
<a href="https://app.fossa.io/projects/git%2Bgithub.com%2Feddiejibson%2Flimitrr?ref=badge_shield" alt="FOSSA Status"><img src="https://app.fossa.io/api/projects/git%2Bgithub.com%2Feddiejibson%2Flimitrr.svg?type=shield"/></a>
<img src="https://david-dm.org/eddiejibson/limitrr.svg">
<img src="https://img.shields.io/npm/dt/limitrr.svg">
<a href="#backers" alt="sponsors on Open Collective"><img src="https://opencollective.com/limitrr/backers/badge.svg" /></a> <a href="#sponsors" alt="Sponsors on Open Collective"><img src="https://opencollective.com/limitrr/sponsors/badge.svg" /></a>
<p>NodeJS rate limiting and response delaying using Redis - includes Express middleware.</p>
<h4><a href="https://limitrr.js.org">Official Documentation (limitrr.js.org)</a></h4>
</div>

Limitrr assists with the rate-limiting and "delaying of responses" for various routes within your NodeJS application. Unlike other similar packages, this utility allows the user to limit not only by the number of requests but also the number of completed actions (e.g allowing a certain amount of accounts to be successfully created within a timespan) and have such restricted with custom options. As well as this, custom discriminators are possible - you no longer have to limit by just the user's IP. Limitrr can also delay responses after a certain amount of requests have been made - you don't have to just rate-limit potentially malicious requests, you can delay them instead or as well as. Included also within this package are various middleware functions for Express. However, the core functions work perfectly fine if you're not using such a package and chose to do something else, instead.

I've effectively released a similiar limitrr library, but in PHP. Check it out [here](http://github.com/eddiejibson/limitrr-php)

If you appreciate this project, please 🌟 it on GitHub.

**Pull Requests are welcomed**

## Roadmap

- [x]   Create multiple route limits (separate expiry times e.t.c) without having to initialize the Limitrr class multiple times
- [x]   Return headers to user with rate limiting details - how many requests/actions remain before restrictions are put in place, how long before the values expire and how many requests/actions are allowed per that route.
- [x]   Unit Tests
- [x]   Pass parameters into functions via an object
- [ ]   Ability to slow down responses after a certain amount of requests

## Attention: We've moved the documentation! Each function now has it own page along with better examples.

**Access the new documentation here:** [https://limitrr.js.org](https://limitrr.js.org)

However, if you're familiar with the older documentation (some of which may be deprecated), you can view that [here](oldReadme.md)

## Contributors

This project exists thanks to all the people who contribute. 
<a href="https://github.com/eddiejibson/limitrr/graphs/contributors"><img src="https://opencollective.com/limitrr/contributors.svg?width=890&button=false" /></a>






## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Feddiejibson%2Flimitrr.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Feddiejibson%2Flimitrr?ref=badge_large)
