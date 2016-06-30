import http from 'http'

export default class Errors {
  constructor (statusCode, message) {
    if (statusCode) {
      return this.get(statusCode, message)
    }
  }

  /**
   * Gets an error from predefined Node status codes, and
   * returns a formatted Airflow response.
   * @param {number} statusCode - The status code to lookup/use
   * @param {string} message - An optional response message
   * @return {object} The response object
   */
  get (statusCode, message) {
    const err = {
      statusCode,
      error: http.STATUS_CODES[statusCode] || 'Unknown Error'
    }

    if (message) err.message = message

    return err
  }

  // ---------------------------------------------------------------------------
  // predefined errors
  // ---------------------------------------------------------------------------

  badRequest (msg) {
    return this.get(400, msg)
  }

  unauthorized (msg) {
    return this.get(401, msg)
  }

  paymentRequired (msg) {
    return this.get(402, msg)
  }

  forbidden (msg) {
    return this.get(403, msg)
  }

  notFound (msg) {
    return this.get(404, msg)
  }

  methodNotAllowed (msg) {
    return this.get(405, msg)
  }

  notAcceptable (msg) {
    return this.get(406, msg)
  }

  proxyAuthRequired (msg) {
    return this.get(407, msg)
  }

  requestTimeout (msg) {
    return this.get(408, msg)
  }

  conflict (msg) {
    return this.get(409, msg)
  }

  gone (msg) {
    return this.get(410, msg)
  }

  lengthRequired (msg) {
    return this.get(411, msg)
  }

  preconditionFailed (msg) {
    return this.get(412, msg)
  }

  payloadTooLarge (msg) {
    return this.get(413, msg)
  }

  uriTooLong (msg) {
    return this.get(414, msg)
  }

  unsupportedMediaType (msg) {
    return this.get(415, msg)
  }

  rangeNotSatisfiable (msg) {
    return this.get(416, msg)
  }

  expectationFailed (msg) {
    return this.get(417, msg)
  }

  unprocessableEntity (msg) {
    return this.get(422, msg)
  }

  locked (msg) {
    return this.get(423, msg)
  }

  failedDependency (msg) {
    return this.get(424, msg)
  }

  upgradeRequired (msg) {
    return this.get(426, msg)
  }

  preconditionRequired (msg) {
    return this.get(428, msg)
  }

  tooManyRequests (msg) {
    return this.get(429, msg)
  }

  headersTooLarge (msg) {
    return this.get(431, msg)
  }

  internal (msg) {
    return this.get(500, msg)
  }

  notImplemented (msg) {
    return this.get(501, msg)
  }

  badGateway (msg) {
    return this.get(502, msg)
  }

  serviceUnavailable (msg) {
    return this.get(503, msg)
  }

  gatewayTimeout (msg) {
    return this.get(504, msg)
  }

  httpVersionNotSupported (msg) {
    return this.get(505, msg)
  }

  insufficientStorage (msg) {
    return this.get(507, msg)
  }

  loopDetected (msg) {
    return this.get(508, msg)
  }

  bandwidthLimitExceeded (msg) {
    return this.get(509, msg)
  }

  notExtended (msg) {
    return this.get(510, msg)
  }

  networkAuthRequired (msg) {
    return this.get(511, msg)
  }
}

/**
 * Removes all unwanted clutter from error stack traces.
 * In this case, it removes every line that includes a node_modules file.
 * @param {object} error - An Error object
 * @return {object} An Error object with the modified stack trace
 */
export function cleanStackTrace (error) {
  if (!error.stack) return error

  error.stack = error.stack.split('\n')
    .filter((line) => !line.match(/node_modules\//))
    .join('\n')

  return error
}
