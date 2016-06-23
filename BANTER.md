# Banter

## Usage

Structure should be kept as simple as possible. One main entry file that exports all functions as an array. Each function should be an object with a method type, a path, and a handler. The handler should always return a promise.

## Feature Roadmap

- Deal with request headers
- Custom response headers and status codes
- Deal with query strings and route parameters
- Scheduled functions (like cron jobs)
- Middleware / Plugins
- Environment variables
- Simulated Lambda events (for easy testing)
- Request injecting for testing (similar to Hapi)
- Data validation
- Error handling
- Logging to S3
- Run local server
- Deployment environments (staging, production, etc.)
- Payload limits to prevent malicious use
- Endpoint diffs, showing what has changed, and what will be created/updated/deleted
