# Lightrail

[![Build Status](https://travis-ci.org/jsonmaur/lightrail.svg?branch=master)](https://travis-ci.org/jsonmaur/lightrail)
[![Coverage Status](https://coveralls.io/repos/github/jsonmaur/lightrail/badge.svg?branch=master)](https://coveralls.io/github/jsonmaur/lightrail?branch=master)
[![Code Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Chat Room](https://badges.gitter.im/jsonmaur/lightrail.svg)](https://gitter.im/jsonmaur/lightrail?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> *This package is under active development. Try it out!*

- [Installation](#installation)
- [Example](#example)
- [Configuration](#configuration)
- [Routes](#routes)
- [Handlers](#handlers)
- [PreHandlers](#prehandlers)
- [Async/Await](#asyncawait)
- [Router](#router)
- [Validation](#validation)
- [Errors](#errors)
- [Logging](#logging)
- [Testing](#testing)
- [Plugins](#plugins)
- [Server](#server)
- [Todo](#todo)
- [Contributing](#contributing)
- [License](#license)

Lightrail is a micro web framework for building APIs in Node.js. Based on configuration and promises, it keeps things simple, predictable, and is a breeze to get started. It comes with built-in input validation, a routing library, an error library, support for pre-handlers (aka middleware), and more. An ideal solution for [microservices](https://en.wikipedia.org/wiki/Microservices)!

#### Why another Node framework?

There are a lot of great frameworks out there such as [Express](http://expressjs.com), [Restify](http://restify.com), [Koa](http://koajs.com), and [Hapi](http://hapijs.com). They have been around for awhile, and we have learned a lot about Node in the process. But they have become bloated and are overkill for most apps. Lightrail is a lightweight approach that takes ideas from other frameworks and brings them together in a simple way.

<a name="installation"></a>
## Installation

```bash
$ npm install lightrail --save
# or to use the CLI
$ npm install lightrail -g
```

<a name="example"></a>
## Example

```javascript
const Lightrail = require('lightrail')

new Lightrail({/* configuration */}).route({
  method: 'GET',
  url: '/hello/:name',
  handler: (req) => {
    const { name } = req.params
    return { message: `Hello, ${name}!` }
  }
}).start()
```

That's it! Run this code and go to `http://localhost:8000/hello/jason`. You should see `{"message":"Hello, jason!"}`.

<a name="configuration"></a>
## Configuration

There are several config options, all of which have optimal values by default. But they can be easily changed by passing an object to the Lightrail instance (see the example above).

- `name` The name of the server, set in the `Server` response header. Can be set to `false` to omit the header entirely.
  > Type: string, boolean  
  > Default: `Lightrail`

- `host` The host to run the server on. Uses the `HOST` environment variable if it exists.
  > Type: string  
  > Default: `process.env.HOST || '0.0.0.0'`

- `port` The port to run the server on. Uses the `PORT` environment variable if it exists.
  > Type: number  
  > Default: `process.env.PORT || 8000`

- `pretty` Whether to prettify the response JSON. This will always be true if `process.env.NODE_ENV ^= 'dev'` (starts with `dev`).
  > Type: boolean  
  > Default: `false`

- `timeout` The amount of time in milliseconds to wait before a request is timed out, returning a 408 timeout error to the user.
  > Type: number  
  > Default: `5000` (5s)

- `payloadLimit` The max size (in bytes) a request payload can be. This prevents malicious use from users sending giant payloads to your API. Will return a 413 payload too large error if exceeded.
  > Type: number  
  > Default: `1048576` (1mb)

- `stripUnknown` Whether to take out unknown values from the request payload and URL query data. This only takes effect if [validation](#validation) is running on the endpoint, and will throw away any value not included in the validation object.
  > Type: boolean  
  > Default: `true`

- `protective` Whether to add basic security headers on the response. Will currently add `X-Content-Type-Options: nosniff` and `X-Frame-Options: deny` if enabled.
  > Type: boolean  
  > Default: `true`

- `realIp` Whether to check for an IP address in the `X-Forwarded-For` header, taking the first address from the comma-separated list. This helps get the user's real IP address if the request is coming through a proxy server. Will fallback to the actual IP address if the header is not found.
  > Type: boolean  
  > Default: `true`

- `logs` Tag names of the loggers to enable. See [Logging](#logging) for more info on the tags available. Can also be set to `false` to disable all logging.
  > Type: array, boolean  
  > Default: `['server', 'request', 'error']`

- `preHandlers` Global functions to run for every route in the app. See [PreHandlers](#prehandlers) for more info.
  > Type: array  
  > Default: `[]`

<a name="routesconfig"></a>
## Routes Config

A route is defined by a simple object with the following configuration.

- `method` The method to use for the route. This is usually one of `GET, POST, PUT, PATCH, DELETE` if using the HTTP protocol, but can be set to anything if using a custom protocol.
  > Type: string  
  > Required: yes

- `url` The endpoint of the route. This can include named segments, and can also be a regular expression. See [Router](#router) for more info.
  > Type: string, regexp  
  > Required

- `statusCode` The HTTP status code to return on a **successful** response.
  > Type: number  
  > Default: `200`

- `validate` The validations to run against the request. See [Validation](#validation) for more info.
  > Type: object  

- `preHandlers` The preHandler functions to run before the route's handler. See [PreHandlers](#prehandlers) for more info.
  > Type: array  

- `handler` The request handler function. See [Handlers](#handlers) for more info.
  > Type: function  
  > Required

- `onError` A custom function to run when an error occurs (overwrites default error handling). See [Errors](#errors) for more info.
  > Type: function  

<a name="handlers"></a>
## Handlers

<a name="prehandlers"></a>
## PreHandlers

<a name="asyncawait"></a>
## Async/Await

Since handlers are based on Promises, you can easily use ES7's async await feature (as long as you are transpiling your code using something like [Babel](http://babeljs.io)). Any errors thrown are caught by Lightrail's error handler and outputted correctly, or the custom `onError` route function (see [Routes Config](#routesconfig)). This removes the need to have a bunch of try/catch blocks (though you can still have them if you need to). Errors within sub-promises (such as the `createUser` function in the example below) will bubble up to the handler.

```javascript
server.route({
  method: 'POST',
  url: '/signup',
  statusCode: 201,
  handler: async (req) => {
    const user = await createUser(req.body)
    return { user }
  }
})
```

*Note: If using Node >=6, all you need for async await is [transform-async-to-generator](https://babeljs.io/docs/plugins/transform-async-to-generator) rather than an entire preset.*

<a name="router"></a>
## Router

<a name="validation"></a>
## Validation

- `required()`
- `contains(seed)`
- `equals(compare)`
- `isAfter(date)`
- `isAlpha(locale)`
- `isAlphanumeric(locale)`
- `isAscii()`
- `isBase64()`
- `isBefore(date)`
- `isBoolean()`
- `isCurrency(opts)`
- `isDataURI()`
- `isDate()`
- `isDivisibleBy(num)`
- `isEmail(opts)`
- `isFQDN(opts)`
- `isIpAddress(ver)`
- `isEnum(values)`
- `isNumber(opts = {})`
- `isJSON()`
- `isLength(opts)`
- `isLowercase()`
- `isMACAddress()`
- `isPhoneNumber(locale)`
- `isMongoId()`
- `isURL(opts)`
- `isUUID(ver)`
- `isUppercase()`
- `isWhitelisted(chars)`
- `matches(pattern, mods)`

<a name="errors"></a>
## Errors

Any errors occurring throughout the application or in an [async/await](#asyncawait) function will be automatically logged and formatted for the response. Errors can occur in a few different ways:

- By `throw`ing anywhere in the app
- Returning an error object from a handler
- An unhandled promise rejection

Error responses are simply objects with the following structure:

- `statusCode` The status code of the error (uses `500` for unknown errors)
- `error` The error type that occurred
- `message` The descriptive error message for the user

If a [Javascript Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) is thrown, a `500 Internal Server Error` will be returned, and **if in dev mode**, the error message will be returned as well (otherwise just the 500 error). All server errors (meaning statusCode is >= 500) will be logged to the console with a description and stack trace.

Lightrail comes with a list of predefined errors that accept custom messages. See the example below.

```javascript
const { Errors } = require('lightrail')

server.route({
  //...
  handler: async () => {
    const resource = getNonExistantResource()
    if (!resource) {
      throw new Errors().notFound('resource does not exist')
    }
    return resource
  }
})
```
```json
{
  "statusCode": 404,
  "error":"Not Found",
  "message":"resource does not exist"
}
```

#### Predefined Errors

- `new Errors().badRequest()`
- `new Errors().unauthorized()`
- `new Errors().paymentRequired()`
- `new Errors().forbidden()`
- `new Errors().notFound()`
- `new Errors().methodNotAllowed()`
- `new Errors().notAcceptable()`
- `new Errors().proxyAuthRequired()`
- `new Errors().requestTimeout()`
- `new Errors().conflict()`
- `new Errors().gone()`
- `new Errors().lengthRequired()`
- `new Errors().preconditionFailed()`
- `new Errors().payloadTooLarge()`
- `new Errors().uriTooLong()`
- `new Errors().unsupportedMediaType()`
- `new Errors().rangeNotSatisfiable()`
- `new Errors().expectationFailed()`
- `new Errors().unprocessableEntity()`
- `new Errors().locked()`
- `new Errors().failedDependency()`
- `new Errors().upgradeRequired()`
- `new Errors().preconditionRequired()`
- `new Errors().tooManyRequests()`
- `new Errors().headersTooLarge()`
- `new Errors().internal()`
- `new Errors().notImplemented()`
- `new Errors().badGateway()`
- `new Errors().serviceUnavailable()`
- `new Errors().gatewayTimeout()`
- `new Errors().httpVersionNotSupported()`
- `new Errors().insufficientStorage()`
- `new Errors().loopDetected()`
- `new Errors().bandwidthLimitExceeded()`
- `new Errors().notExtended()`
- `new Errors().networkAuthRequired()`

<a name="logging"></a>
## Logging

<a name="testing"></a>
## Testing

<a name="plugins"></a>
## Plugins

<a name="server"></a>
## Server

<a name="todo"></a>
## Todo

- [ ] Scheduled functions (like cron jobs)
- [ ] Functions calling other functions
- [ ] Environment variables
- [ ] Simulated Lambda events (for easy testing)
- [ ] Auto-set environments with CLI
- [ ] Send logs to S3/CloudWatch
- [ ] Deployment environments (staging, production, etc.)
- [ ] Endpoint diffs, showing what has changed, and what will be created/updated/deleted
- [ ] Redirect trailing slashes
- [ ] Gzipping Response
- [ ] Custom cache control
- [ ] Handle large payloads / file uploads / file descriptors
- [ ] Automatically generate docs, show when you visit API with browser
- [ ] Setup default/configurable CORS options

<a name="contributing"></a>
## Contributing

Do it.

<a name="license"></a>
## License

[MIT](LICENSE) © [Jason Maurer](http://maur.co)
