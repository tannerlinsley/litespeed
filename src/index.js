try {
  require('source-map-support').install()
} catch (err) { /* no sourcemap support */ }

import http from 'http'
import anyBody from 'body/any'
import { getRoutes, fingerprint } from './utils/router'
import { errors, getError, cleanStackTrace } from './utils/errors'

class Airflow {
  /**
   * Initializes config options.
   * @param {object} opts - The config options
   */
  constructor (opts = {}) {
    /* the host to run on */
    this.host = opts.host || 'localhost'
    /* the port to run on */
    this.port = parseInt(opts.port, 10) || 8000
    /* a glob-style pattern for the function/route files */
    this.functions = opts.functions || 'functions/**/*.js'
    /* payload byte limit */
    this.byteLimit = opts.byteLimit || 1048576 // 1mb default

    /* the global route map */
    this.routes = getRoutes(this.functions)
  }

  /**
   * Creates the server and begins listening.
   * @param {object} opts - Server options
   * @returns {promise} Resolves with the server url
   */
  start () {
    /* create http server and setup request handler */
    const server = http.createServer(this.onRequest.bind(this))

    /* where the server can be accessed */
    const url = `http://${this.host}:${this.port}`

    /* returns a promise resolving with the server url */
    return new Promise((resolve, reject) => {
      server.listen(this.port, this.host, () => resolve(url))
    })
  }

  /**
   * The server's request handler.
   * @param {object} request - The http server request
   * @param {object} response - The http server response
   */
  async onRequest (req, res) {
    try {
      /* finds the requested route from the routes map */
      const route = this.routes[fingerprint(req)]
      if (!route) throw errors.notFound()

      /* parse payload body to a Buffer */
      const body = await new Promise((resolve, reject) => {
        anyBody(req, {
          limit: route.byteLimit || this.byteLimit
        }, (err, result) => {
          if (err) reject(err)
          else resolve(result)
        })
      })

      /* get client info */
      const remoteAddress = req.connection.remoteAddress || req.socket.remoteAddress
      const remoteFamily = req.connection.remoteFamily || req.socket.remoteFamily

      /* run the user-defined route handler, returning a value or promise */
      const handlerResult = route.handler({
        body,
        headers: req.headers,
        meta: { remoteAddress, remoteFamily }
      })

      /* resolve the promise if one is returned */
      const response = (handlerResult && handlerResult.then
        ? await handlerResult : handlerResult) || {}

      /* get status code from response or route */
      const code = typeof handlerResult === 'object' && response.statusCode
        ? response.statusCode : route.statusCode

      /* an error ocurred */
      if (code >= 400 || response instanceof Error) throw response

      this.respond(res, code, { response })
    } catch (err) {
      const code = err.statusCode || 500

      /* properly log server errors */
      if (code >= 500) {
        let errLog = err
        if (!(errLog instanceof Error)) {
          errLog = new Error(JSON.stringify(errLog))
        }
        console.error(cleanStackTrace(errLog))
      }

      /* format error (if not already formatted) */
      const message = err.message || err
      const response = message.error ? message : getError(code, message)

      /* don't send server error messages to user unless in dev mode */
      if (code >= 500 && !String(process.env.NODE_ENV).match(/dev/i)) {
        delete response.message
      }

      this.respond(res, code, { response })
    }
  }

  /**
   * Responds to a request with the correct status code and headers.
   * Will auto-format the response into an Airflow object if needed,
   * as well as stringify response objects.
   * @param {object} res - The http server response
   * @param {number} statusCode - The status code to respond with
   */
  respond (res, statusCode, opts = {}) {
    if (typeof opts !== 'object') {
      throw new TypeError('options must be an object!')
    }

    /* stringify and prettify response object */
    opts.response = opts.response
      ? JSON.stringify(opts.response, null, 2)
      : 'OK'

    /* send proper status code and headers */
    res.writeHead(parseInt(statusCode, 10) || 200, {
      'Server': 'Airflow',
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': opts.response.length,
      'Cache-Control': 'no-cache'
    })

    /* send response */
    res.write(opts.response)
    res.end()
  }
}

module.exports = Airflow
module.exports.Errors = errors
