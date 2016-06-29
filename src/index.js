import http from 'http'
import qs from 'querystring'
import stream from 'stream'
import rawBody from 'raw-body'
import typer from 'media-typer'
import validation from './validation'
import { errors, getError, cleanStackTrace } from './errors'

class Airflow {
  /**
   * Initializes config options.
   * @param {object} opts - The config options
   */
  constructor (opts = {}) {
    /* get environment */
    this.env = String(process.env.NODE_ENV)

    /* whether we are in dev mode */
    this.isDev = this.env.match(/dev/i)

    /* set server name (displays as Server header) */
    this.name = opts.name || 'Airflow'

    /* the host to run on */
    this.host = opts.host || 'localhost'

    /* the port to run on */
    this.port = parseInt(opts.port, 10) || 8000

    /* request timeout limit (5s default) */
    this.timeout = parseInt(opts.timeout, 10) || 5000

    /* limit for payload size in bytes (1mb default) */
    this.payloadLimit = parseInt(opts.payloadLimit, 10) || 1048576

    /* setup log tags */
    this.logs = opts.logs !== false
      ? Object.assign({}, { server: true, request: true, error: true }, opts.logs || {})
      : { server: false, request: false, error: false } // turns all logging off

    /* the global route map */
    this.routeMap = {}
  }

  /**
   * Creates the server and begins listening.
   * @param {object} opts - Server options
   * @returns {promise} Resolves with the server url
   */
  start () {
    /* create http server and setup request handler */
    const server = http.createServer(this.onRequest.bind(this))
    const url = `http://${this.host}:${this.port}`

    server.timeout = this.timeout

    /* returns a promise resolving with the server url */
    return new Promise((resolve, reject) => {
      server.listen(this.port, this.host, () => {
        if (this.logs.server) {
          console.log(`=> Running at ${url}`)
        }
        resolve(url)
      })
    })
  }

  /**
   * The server's request handler.
   * @param {object} request - The http server request
   * @param {object} response - The http server response
   */
  async onRequest (request, response) {
    let route
    try {
      /* get ip address of client */
      const remoteAddress = this.getIpAddress(request)

      /* log request */
      if (this.logs.request) {
        console.log(`=> ${new Date().toISOString()} ${request.method} ${request.url} from ${remoteAddress}`)
      }

      /* get url query data */
      const queryRegex = request.url.match(/\?.*$/) || {}
      const query = Array.isArray(queryRegex)
        ? qs.parse(queryRegex[0].substring(1)) : {}

      /* get url params */
      const params = {} // TODO!

      /* get url ready for lookup */
      if (queryRegex.index) {
        request.url = request.url.substring(0, queryRegex.index)
      }

      /* lookup from route map */
      route = this.routeMap[this.fingerprint(request)]
      if (!route) throw errors.notFound()

      /* setup timeout */
      let hasTimedOut = false
      response.setTimeout(this.timeout, (socket) => {
        const msg = `Max request time of ${this.timeout / 1000}s reached`

        this.respond(response, 408, getError(408, msg))
        hasTimedOut = true

        socket.destroy()
      })

      /* parse content type so we can process data */
      const contentType = request.headers['content-type'] || 'text/plain; charset=utf-8'
      const mediaType = typer.parse(contentType)

      /* get request body data */
      let body = {}
      if (request.method.match(/^(post|put|patch)$/i)) {
        // TODO: stream.destroy or stream.close needed for file descriptors?
        body = await rawBody(request, {
          limit: this.payloadLimit,
          length: request.headers['content-length'],
          encoding: mediaType.parameters.charset || 'utf-8'
        })
      }

      /* process body data */
      switch (mediaType.subtype) {
        case 'json':
          try {
            body = JSON.parse(body)
          } catch (err) {
            throw errors.badRequest('Invalid JSON payload')
          }
          break
        case 'x-www-form-urlencoded':
          try {
            body = qs.parse(body)
          } catch (err) {
            throw errors.badRequest('Invalid form data')
          }
          break
        case 'plain':
          /* no processing needed */
          break
        default:
          throw errors.unsupportedMediaType()
      }

      /* run validations */
      await new Promise((resolve, reject) => {
        const allErrors = []

        /* defaults */
        route.validation = route.validation || {}
        route.validation.body = route.validation.body || {}
        route.validation.query = route.validation.query || {}
        route.validation.params = route.validation.params || {}

        /* validate body data */
        for (const i in route.validation.body) {
          const validateResult = route.validation.body[i].run(i, body[i])
          if (validateResult.length > 0) allErrors.push(validateResult)
        }

        /* validate query data */
        for (const i in route.validation.query) {
          const validateResult = route.validation.query[i].run(i, query[i], 'query')
          if (validateResult.length > 0) allErrors.push(validateResult)
        }

        /* validate params data */
        for (const i in route.validation.params) {
          const validateResult = route.validation.params[i].run(i, params[i], 'params')
          if (validateResult.length > 0) allErrors.push(validateResult)
        }

        /* reject with 400 error and validation errors if there are any */
        if (allErrors.length > 0) {
          return reject({
            ...errors.badRequest('A validation error occured'),
            validation: allErrors
          })
        }

        resolve()
      })

      /* request data sent through to route handler */
      const requestData = {
        query, body, params,
        headers: request.headers,
        info: { remoteAddress }
      }

      /* response functions exposed to handler */
      const responseData = {
        setHeader: (name, value) => response.setHeader(name, value)
      }

      const handlerResult = route.handler(requestData, responseData)
      /* resolve the promise if one is returned */
      // TODO: somehow cancel the promise when request times out
      const result = (handlerResult && handlerResult.then
        ? await handlerResult : handlerResult) || { __noResponse: true }

      /* get status code from response or route */
      const statusCode = typeof result === 'object' && result.statusCode
        ? result.statusCode : route.statusCode

      /* result is an error, send it to the catch */
      if (statusCode >= 400 || result instanceof Error) {
        throw result
      }

      /* respond with result */
      if (!hasTimedOut) this.respond(response, statusCode, result)
    } catch (error) {
      /* catch errors within the error handler :) */
      try {
        if (typeof route.onError === 'function') {
          const onErrorResponse = route.onError(error)
          const errorResponse = onErrorResponse.then
            ? await onErrorResponse : onErrorResponse

          const statusCode = errorResponse.statusCode || 500
          return this.respond(response, statusCode, errorResponse)
        }

        const statusCode = error.statusCode || 500

        /* format error if it's not already */
        const errorResponse = !error.error
          ? getError(statusCode, error.message || error)
          : error

        /* display and log server errors correctly */
        if (statusCode >= 500) {
          if (this.logs.error) {
            let toLog = error

            /* turn into an error if needed */
            if (!(toLog instanceof Error)) {
              toLog = new Error(JSON.stringify(toLog))
            }

            /* log out error with a filtered stack trace */
            console.error(cleanStackTrace(toLog))
          }

          /* remove server errors unless in dev mode */
          if (statusCode >= 500 && !this.isDev && errorResponse.message) {
            delete errorResponse.message
          }
        }

        /* respond with error */
        this.respond(response, statusCode, errorResponse)
      } catch (err) {
        console.error(err)
        this.respond(response, 500, getError(500))
      }
    }
  }

  /**
   * Responds to a request with the correct status code and headers.
   * Will auto-format the response into an Airflow object if needed,
   * as well as stringify response objects.
   * @param {object} res - The http server response
   * @param {number} statusCode - The status code to respond with
   */
  respond (res, statusCode, data) {
    /* send proper status code and headers */
    res.statusCode = parseInt(statusCode, 10) || 200
    res.setHeader('Server', this.name)
    res.setHeader('Cache-Control', 'no-cache')

    /* send correct headers and response based on data type */
    if (data) {
      if (Buffer.isBuffer(data)) {
        res.setHeader('Content-Type', 'application/octet-stream')
        res.setHeader('Content-Length', data.length)
        res.end(data)
      } else if (data instanceof stream.Stream) {
        res.setHeader('Content-Type', 'application/octet-stream')
        data.pipe(res)
      } else {
        res.setHeader('Content-Type', 'text/plain')
        if (typeof data === 'object') {
          /* set if the handler doesn't return anything */
          /* defaults to this __noResponse object above */
          if (data.__noResponse) {
            data = ''
          } else {
            /* only prettify in dev mode to take advantages of V8 optimizations */
            data = this.isDev ? JSON.stringify(data, null, 2) : JSON.stringify(data)
            res.setHeader('Content-Type', 'application/json')
          }
        }
        /* must use byteLength since we need the actual length vs # of characters */
        res.setHeader('Content-Length', Buffer.byteLength(data))
        res.end(data)
      }
    } else {
      res.end()
    }
  }

  /**
   * Defines a single route and adds to the route map.
   * @param {object} config - The airflow route config
   */
  route (config) {
    if (!config) {
      throw new TypeError('Routes must have a configuration object')
    }

    /* create base64 encoded key */
    const key = this.fingerprint(config)
    /* make sure route isn't a duplicate */
    if (this.routeMap[key]) {
      throw new Error(`"${config.method} ${config.url}" is defined more than once`)
    }

    /* add to route map */
    this.routeMap[key] = config
  }

  /**
   * Fingerprints a route for easy lookup from the route map.
   * @param {object} route - The airflow route object
   * @returns The encoded string
   */
  fingerprint (route) {
    /* makes sure there is a handler if we are parsing an airflow route */
    /* !route.socket will be true if it is an incoming request */
    if (!route.socket && typeof route.handler !== 'function') {
      throw new TypeError('Route handler must be a function!')
    }
    if (!route.method.match(/^(get|post|put|patch|delete)$/i)) {
      throw new TypeError('Route method must be one of GET, POST, PUT, PATCH, DELETE')
    }
    if (typeof route.url !== 'string') {
      // TODO: check for a valid url
      throw new TypeError('Route URL must be a string')
    }

    /* simply concats the method and url, and base64 encodes it */
    return new Buffer(`${route.method}:${route.url}`).toString('base64')
  }

  /**
   * Gets an IP address from a Hapi request, taking into account
   * multiple forwarded addresses (such as from a proxy server).
   * @param {object} request - The request send through by a Hapi handler
   * @returns {string} The user's IP address (best guess)
   */
  getIpAddress (request) {
    const remote = request.connection.remoteAddress || request.socket.remoteAddress

    const forwarded = request.headers['x-forwarded-for']
    if (!forwarded) return remote

    /* return first in the list if there are many */
    return String(forwarded).split(',')[0].trim()
  }
}

module.exports = Airflow
module.exports.Errors = errors
module.exports.Validator = validation
