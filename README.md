# Litespeed

[![Build Status](https://travis-ci.org/jsonmaur/litespeed.svg?branch=master)](https://travis-ci.org/jsonmaur/litespeed)
[![Coverage Status](https://coveralls.io/repos/github/jsonmaur/litespeed/badge.svg?branch=master)](https://coveralls.io/github/jsonmaur/litespeed?branch=master)
[![Code Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Chat Room](https://badges.gitter.im/jsonmaur/litespeed.svg)](https://gitter.im/jsonmaur/litespeed?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

- [Installation](#installation)
- [Example](#example)
- [Configuration](#configuration)
- [Routes Config](#routesconfig)
- [Handlers](#handlers)
- [PreHandlers](#prehandlers)
- [Router](#router)
- [Validation](#validation)
- [Errors](#errors)
- [Logging](#logging)
- [Server API](#serverapi)
- [Plugins](#plugins)

Litespeed is a micro web framework for building APIs in Node.js. Based on configuration and promises, it keeps things fast, simple, predictable, and is a breeze to get started. It comes with built-in input validation, a routing library, an error library, support for pre-handlers (aka middleware), and more. A perfect solution for [microservices](https://en.wikipedia.org/wiki/Microservices)!

#### Why another Node framework?

There are a lot of great frameworks out there such as [Express](http://expressjs.com), [Restify](http://restify.com), [Koa](http://koajs.com), and [Hapi](http://hapijs.com). They have been around for awhile, and each have their place in the Javascript ecosystem. But a lot of the time, they can be overkill for your app, especially if you need something simple but extendable for a microservice API. Litespeed is a lightweight approach that takes ideas from other frameworks and brings them together in a compact and easy to understand way. It's also nice to have built-in validation, error handling, and logging ;)

<a name="installation"></a>
## Installation

```bash
$ npm install litespeed --save
# or to use the CLI
$ npm install litespeed -g
```

<a name="example"></a>
## Example

```javascript
const Litespeed = require('litespeed')

new Litespeed({/* configuration */}).route({
  method: 'GET',
  url: '/hello/:name',
  handler: (req) => {
    return { message: `Hello, ${req.params.name}!` }
  }
}).start()
```

That's it! Run this code and go to `http://localhost:8000/hello/jason`. You should be greeted with `{"message":"Hello, jason!"}`.

<a name="configuration"></a>
## Configuration

There are several config options, all of which have optimal values by default. But they can be easily changed by passing an object to the Litespeed instance (see the example above).

- `name` The name of the server, set in the `Server` response header. Can be set to `false` to omit the header entirely.

  > Type: string, boolean  
  > Default: `Litespeed`

- `host` The host to run the server on. Uses the `HOST` environment variable if it exists.

  > Type: string  
  > Default: `process.env.HOST || '0.0.0.0'`

- `port` The port to run the server on. Uses the `PORT` environment variable if it exists.

  > Type: number  
  > Default: `process.env.PORT || 8000`

- `trailingSlash` Whether to accept a URL both with and without a trailing slash. If `true`, the trailing slash is ignored and the route is still found. If `false`, the route will return a 404 with a trailing slash.

  > Type: boolean  
  > Default: `true`

- `pretty` Whether to prettify the response JSON.

  > Type: boolean  
  > Default: `false` or `true if NODE_ENV starts with "dev"`

- `timeout` The amount of time in milliseconds to wait before a request is timed out, returning a 408 error to the client.

  > Type: number  
  > Default: `5000` (5s)

- `payloadLimit` The max size (in bytes) a request payload can be. This helps prevents malicious use by client's sending giant payloads to your API. Will return a 413 error if exceeded.

  > Type: number  
  > Default: `1048576` (1mb)

- `stripUnknown` Whether to take out unknown values from the request payload and URL query data. This only takes effect if [validation](#validation) is running on the endpoint, and will throw away any value not included in the validation object.

  > Type: boolean  
  > Default: `true`

- `protective` Whether to add basic security headers on the response and require a user-agent. Will currently add `X-Content-Type-Options: nosniff` and `X-Frame-Options: deny`, and send a 403 error if no `User-Agent` header is present on the request.

  > Type: boolean  
  > Default: `true`

- `realIp` Whether to check for an IP address in the `X-Forwarded-For` header, taking the first address from the comma-separated list. This helps get the client's real IP address if the request is coming through a proxy server. Will fallback to the actual IP address if the header is not found.

  > Type: boolean  
  > Default: `true`

<a name="logtags"></a>
- `logs` Tag names of the loggers to enable. See [Logging](#logging) for more info on the tags available. Can also be set to `false` to disable all logging.

  > Type: array, boolean  
  > Default: all

- `logTimestamp` Whether to log the current timestamp with each message.

  > Type: boolean  
  > Default: `true`

<a name="logcolors"></a>
- `logColors` Whether to use CLI logColors when logging.

  > Type: boolean  
  > Default: `true`

<a name="global-prehandler"></a>
- `preHandlers` Global functions to run for every route in the app. See [PreHandlers](#prehandlers) for more info.

  > Type: array  
  > Default: `[]`

<a name="routesconfig"></a>
## Routes Config

A route is defined by a simple object with the following configuration.

- `method` The method to use for the route. This is usually one of `HEAD, GET, POST, PUT, PATCH, DELETE` if using the HTTP protocol, but can be set to anything if you're using a custom protocol.

  > Type: string  
  > Required

- `url` The endpoint of the route. This can include segments or be a regular expression. See [Router](#router) for details.

  > Type: string, regexp  
  > Required

- `statusCode` The HTTP status code to return on a **successful** response.

  > Type: number  
  > Default: `200`

- `validate` The validations to run against the request. See [Validation](#validation) for more info.

  > Type: object  

<a name="route-prehandler"></a>
- `preHandlers` The preHandler functions to run before the route's handler. See [PreHandlers](#prehandlers) for more info.

  > Type: array  

- `handler` The request handler function. See [Handlers](#handlers) for more info.

  > Type: function  
  > Required

- `onError` A custom function to run when an error occurs (overwrites default error handling). See [Errors](#errors) for more info. *Note: if this is being used, you are responsible for your own error logging!*

  > Type: function  

#### HTTP OPTIONS

The HTTP OPTIONS request is handled automatically for each URL. If requested, the server will respond with an empty body and the `Allow` header with each method supported for that particular URL.

<a name="handlers"></a>
## Handlers

Route handlers are functions on the route config that handle sending responses to the client. To respond from the handler, you can either return a value or return a Promise. The function has two parameters passed to it: the [request](#request) object and the [response](#response) object.

```javascript
server.route({
  // ...
  handler: (request, response) => {
    return 'welcome!'
  }
})
```

<a name="request"></a>
#### request

The request parameter is an object that contains information about the client request.

- `body` The payload data from the request body.
- `query` The query data from the request URL.
- `params` The param data from the request URL. See [Router](#router) for more info.
- `headers` The request headers.
- `context` The context data passed through the preHandlers. See [Plugins](#plugins) for more info.
- `info` Metadata about the request.
  - `remoteAddress` The client's IP address

<a name="response"></a>
#### response

Unlike other Node web frameworks, the response parameter is not used to actually send the response itself--that is done by returning from the handler (with the exception of `.redirect`). Instead, this object contains helper methods to mutate the response *before it is sent*.

- `.pass(name, value)` Passes context between preHandlers (see [PreHandlers](#prehandlers) for more info). Context data is accessed in the handler with `request.context.*`.
- `.setHeader(name, value)` Sets a response header.
- `.redirect(url, code)` Sends a redirect response to the client. `code` defaults to `301` if not set. There is no need to return anything from the handler after this is called.

<a name="asyncawait"></a>
#### Async/Await

Since handlers are based on Promises, you can easily use ES7's async/await feature. Any errors thrown within the handler are caught by Litespeed's error handler and outputted correctly. This removes the need to have a bunch of try/catch blocks (though you can still have them if you need to). Errors within sub-promises (such as the `createUser` function in the example below) will bubble up to the handler and outputted the same way.

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

*Note: If using Node >=6, all you need for async/await support is [transform-async-to-generator](https://babeljs.io/docs/plugins/transform-async-to-generator) rather than an entire preset.*

<a name="prehandlers"></a>
## PreHandlers

Route preHandlers follow the exact same structure as [Handlers](#handlers), but you can pass an array of them to the [routes config](#route-prehandler) as well as the [server config](#global-prehandler).
*Note: they are guaranteed to run in order, making it possible to rely on context from other preHandlers!*

<a name="router"></a>
## Router

Litespeed comes with a built-in router that supports segment parameters and regular expressions. This provides a quick and flexible way to define your endpoints.
*Note: You cannot have two routes defined with the same method and URL or a startup error will be thrown.*

#### Segments

Segments are named sections of the URL prefixed with `:`, and they can pass values to the handler. You can have as many segments as you want in your URL.

```javascript
server.route({
  // ...
  url: '/welcome/:name',
  handler: (request) => {
    // if requested with /welcome/jason
    // expect request.params.name to equal 'jason'
  }
})
```

#### Regular Expressions

The router also supports regular expressions, including their capture groups for getting data. If you define a URL as a regex with a capture group (a piece wrapped in parentheses), you can access that data by its regex index (`$1`, `$2`, etc.)
*Note: if using a regex as a URL, make sure you either use a regular expression literal or `new RegExp()`. Read [this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) if you're new to regular expressions in Javascript.*

```javascript
server.route({
  // ...
  url: /^\/welcome\/(.*)$/,
  handler: (request) => {
    // if requested with /welcome/jason
    // expect request.params.$1 to equal 'jason'
  }
})
```

<a name="validation"></a>
## Validation

A `validate` object can be used on the [routes config](#routesconfig) to run validations against the request body, query, and params. Litespeed comes with a list of predefined validations, which can be chained together. See the example below on how to use. If `stripUnknown` is enabled on the server, any values not in the `validate` object will be throw away.

The response is not sent after one failed validation. Litespeed will continue through the validations and display *all* errors in the response rather than just the first one. However, only one error from each validation chain is thrown at a time.

```javascript
const { Validator } = require('litespeed')

server.route({
  url: '/resource/:id'
  validate: {
    params: {
      id: new Validator().isUUID()
    },
    body: {
      name: new Validator().required(),
      email: new Validator().required().isEmail()
    }
  }
})
```

Validation errors will look like this in the response:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "A validation error occurred",
  "validation": [
    { "field": "id", "message": "...", "where": "params" },
    { "field": "name", "message": "...", "where": "body" }
  ]
}
```

#### Predefined Validations

- `.required()`
- `.contains(string)`
- `.equals(compare)`
- `.isAfter(date)`
- `.isAlpha(locale)`
- `.isAlphanumeric(locale)`
- `.isAscii()`
- `.isBase64()`
- `.isBefore(date)`
- `.isBoolean()`
- `.isCurrency(opts)`
- `.isDataURI()`
- `.isDate()`
- `.isDivisibleBy(num)`
- `.isEmail(opts)`
- `.isFQDN(opts)`
- `.isIpAddress(ver)`
- `.isEnum(values)`
- `.isNumber(opts = {})`
- `.isJSON()`
- `.isLength(opts)`
- `.isLowercase()`
- `.isMACAddress()`
- `.isPhoneNumber(locale)`
- `.isMongoId()`
- `.isURL(opts)`
- `.isUUID(ver)`
- `.isUppercase()`
- `.isWhitelisted(chars)`
- `.matches(pattern, mods)`

Most of these validations use [validator.js](https://github.com/chriso/validator.js), so visit the Readme in that repo for further details.

<a name="errors"></a>
## Errors

Any errors occurring throughout the application or in an [async/await](#asyncawait) function will be automatically logged and formatted for the response. Errors can occur in a few different ways:

- By `throw`ing anywhere in the app
- Runtime code errors
- Returning an error from a handler
- An unhandled promise rejection

Error responses are simply objects with the following structure:

- `statusCode` The status code of the error (uses `500` for unknown errors)
- `error` The error type that occurred
- `message` A descriptive error message for the client

If a [Javascript Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) is thrown, a `500 Internal Server Error` will be returned, and **if in dev mode** (meaning `NODE_ENV` starts with `dev`), the error message will be sent to the response as well for easy debugging. All server errors (meaning statusCode is >= 500) will be logged to the console with a description and a stack trace.

Litespeed comes with a list of predefined errors that accept custom messages (set as the `message` key in the response). See the example below on how to use them.

```javascript
const { Errors } = require('litespeed')

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

- `400` `.badRequest()`
- `401` `.unauthorized()`
- `402` `.paymentRequired()`
- `403` `.forbidden()`
- `404` `.notFound()`
- `405` `.methodNotAllowed()`
- `406` `.notAcceptable()`
- `407` `.proxyAuthRequired()`
- `408` `.requestTimeout()`
- `409` `.conflict()`
- `410` `.gone()`
- `411` `.lengthRequired()`
- `412` `.preconditionFailed()`
- `413` `.payloadTooLarge()`
- `414` `.uriTooLong()`
- `415` `.unsupportedMediaType()`
- `416` `.rangeNotSatisfiable()`
- `417` `.expectationFailed()`
- `422` `.unprocessableEntity()`
- `423` `.locked()`
- `424` `.failedDependency()`
- `426` `.upgradeRequired()`
- `428` `.preconditionRequired()`
- `429` `.tooManyRequests()`
- `431` `.headersTooLarge()`
- `500` `.internal()`
- `501` `.notImplemented()`
- `502` `.badGateway()`
- `503` `.serviceUnavailable()`
- `504` `.gatewayTimeout()`
- `505` `.httpVersionNotSupported()`
- `507` `.insufficientStorage()`
- `508` `.loopDetected()`
- `509` `.bandwidthLimitExceeded()`
- `510` `.notExtended()`
- `511` `.networkAuthRequired()`

<a name="logging"></a>
## Logging

By default, all Litespeed logging is turned on. This can be modified by specifying [log tags](#logtags) in the server config. Each line outputted to the console includes the server name, a timestamp, and the message. Here are the available log tags:

- `server` Outputs a message when the server starts with its URL.
- `request` Outputs the method, URL, IP address, and response code when a client makes a request.
- `error` Outputs any server errors, meaning any error with a statusCode >= 500 (which includes runtime errors). Logged errors will include a message, and a stack trace.

Colors in the output can be turned off if they are causing problems by specifying `logColors: false` in the [server config](#logcolors). *Note: if you specify any log tags, the default tags will be overwritten. So whatever you specify will be the only active tags.*

<a name="serverapi"></a>
## Server API

The Litespeed server is a class that must be instantiated with the `new` keyword, and can be passed an optional object of configuration options.

```javascript
const server = new Litespeed({/* configuration */})
```

##### server.start(callback)

Starts the server on the host and port defined in the instantiation. This will return a promise or you can use a callback, both of which pass the URL of the server.

```javascript
/* with a callback */
server.start((url) => console.log(`Running at ${url}`))

/* or with a promise */
server.start().then((url) => console.log(`Running at ${url}`))
```

##### server.route(config)

Creates a new route. Can be a single route config, or an array of configs for creating multiple routes at once. See [Routes Config](#routesconfig) for structure.

```javascript
/* for a single route */
server.route({/* route config */})

/* for many routes */
server.route([
  {/* route config */},
  {/* route config */}
])
```

##### server.routes(config)

You can use this to scan a directory and pull in routes from many files. Prevents having to manually require and create all your routes. Takes a config object with the following structure.

- `dir` A [glob](https://en.wikipedia.org/wiki/Glob_(programming)) pattern to search for.

  > Type: string  
  > Default: `routes/**/*.js`

- `cwd` The current working directory to use.

  > Type: string  
  > Default: `process.cwd()`

```javascript
server.routes({
  dir: 'routes/**/*.js',
  cwd: __dirname
})
```

##### server.inject(config)

Lets you inject API requests without the overhead of starting the server. This works great for running integration tests on your endpoints. Takes an object with a `method` and `url`, as well as optional `headers` and `body`. Returns a Promise resolving with the response.

```javascript
/* define the route */
server.route({
  method: 'POST',
  url: '/test',
  handler: (req) => req.body.name
})

/* test the route */
server.inject({
  method: 'POST',
  url: '/test',
  body: { name: 'Jason' }
}).then((res) => {
  // expect res to equal 'Jason'
})
```

<a name="plugins"></a>
## Plugins

Litespeed easily supports third-party plugins through the use of [PreHandlers](#prehandlers). To create a plugin, simply create a preHandler that exports a function returning a Promise (if async). Then it can be set as a [global preHandler](#global-prehandler) in the app using the plugin. That's it!

You can also pass context from your plugin to other plugins as well as the route handler by using `response.pass(name, value)` (see [response](#response)). These values are then accessed with `request.context.*`.

##### Rate Limiter Example

###### limiter.js
```javascript
const redis = require('then-redis')
const { Errors } = require('litespeed')

module.exports = async (request, response) => {
  const id = `limits:${request.info.remoteAddress}`
  const limit = 2500
  const expiration = 3600 // 1 hour

  const count = await redis.get(id)

  response.setHeader('X-RateLimit-Limit', limit)
  response.setHeader('X-RateLimit-Remaining', (count || limit) - 1)

  if (count) {
    if (count <= 1) {
      throw new Errors().tooManyRequests()
    }

    await redis.decr(id)
  } else {
    await redis.set(id, limit)
    await redis.expire(id, expiration)
  }
}
```

###### index.js
```javascript
const rateLimiter = require('./limiter')

new Litespeed({
  // ...
  preHandlers: [rateLimiter]
})
```

<a name="contributing"></a>
## Contributing

If you come across an issue or have a feature idea, don't hesitate to create a pull request/issue to discuss it.

![Just do it.](http://i.giphy.com/ACcXRXwUqJ6Ok.gif)

<a name="license"></a>
## License

[MIT](LICENSE)

<!-- ## Todo

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
- [ ] Setup default/configurable CORS options -->
