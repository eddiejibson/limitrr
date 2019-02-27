# Headers

If you're using the `.limit()` middleware function for Express, then this section may be of interest to you. If you're not, then it's pretty much irrelevant and you can skip this.

The `.limit()` middleware function will return headers to the user. They are defined as followed:

- `X-RateLimit-Limit`: What is the maximum amount of requests a user can make to this route before they are rate limited.
- `X-RateLimit-Remaining`: How many requests does the user have remaining before they are rate limited.
- `X-RateLimit-Reset`: How much time does the user have (in seconds) before their current count of requests are reset.
- `X-RateLimit-Limit-Actions`: What is the maximum amount of completed actions (e.g user registration) a user can complete via this route before 
they are rate limited.
- `X-RateLimit-Remaining-Actions`: How many completed actions can the user make before they are rate limited.
- `X-RateLimit-Reset-Actions`: How much time does the user have (in seconds) before their current count of completed actions are reset.