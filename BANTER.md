# Banter

## Usage

Structure should be kept as simple as possible. One main entry file that exports all functions as an array. Each function should be an object with a method type, a path, and a handler. The handler should always return a promise.

## Feature Roadmap

- [x] Deal with request headers
- [x] Custom response headers and status codes
- [ ] Deal with query strings and route parameters
- [ ] Scheduled functions (like cron jobs)
- [ ] Functions calling other functions
- [ ] Middleware / Plugins
- [ ] Environment variables
- [ ] Simulated Lambda events (for easy testing)
- [ ] Request injecting for testing (similar to Hapi)
- [x] Data validation
- [x] All error handling
- [x] Send full errors to client when in dev mode
- [ ] Autoset environments with CLI
- [x] Logging requests, errors
- [ ] Send logs to S3/CloudWatch
- [x] Run local server
- [ ] Deployment environments (staging, production, etc.)
- [x] Payload limits to prevent malicious use
- [x] Multiple character encodings / charsets
- [ ] Endpoint diffs, showing what has changed, and what will be created/updated/deleted
- [ ] Request throttling
- [x] Get requester's IP Address, taking into account proxies
- [ ] Gzipping Response
- [ ] Custom cache control
- [ ] Handle large payloads / file uploads / file descriptors
