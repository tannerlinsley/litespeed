import http from 'http'

export default class Errors {
  constructor () {
    this.badRequest = (msg) => this.get(400, msg)
    this.unauthorized = (msg) => this.get(401, msg)
    this.paymentRequired = (msg) => this.get(402, msg)
    this.forbidden = (msg) => this.get(403, msg)
    this.notFound = (msg) => this.get(404, msg)
    this.methodNotAllowed = (msg) => this.get(405, msg)
    this.notAcceptable = (msg) => this.get(406, msg)
    this.proxyAuthRequired = (msg) => this.get(407, msg)
    this.requestTimeout = (msg) => this.get(408, msg)
    this.conflict = (msg) => this.get(409, msg)
    this.gone = (msg) => this.get(410, msg)
    this.lengthRequired = (msg) => this.get(411, msg)
    this.preconditionFailed = (msg) => this.get(412, msg)
    this.payloadTooLarge = (msg) => this.get(413, msg)
    this.uriTooLong = (msg) => this.get(414, msg)
    this.unsupportedMediaType = (msg) => this.get(415, msg)
    this.rangeNotSatisfiable = (msg) => this.get(416, msg)
    this.expectationFailed = (msg) => this.get(417, msg)
    this.unprocessableEntity = (msg) => this.get(422, msg)
    this.locked = (msg) => this.get(423, msg)
    this.failedDependency = (msg) => this.get(424, msg)
    this.upgradeRequired = (msg) => this.get(426, msg)
    this.preconditionRequired = (msg) => this.get(428, msg)
    this.tooManyRequests = (msg) => this.get(429, msg)
    this.headersTooLarge = (msg) => this.get(431, msg)
    this.internal = (msg) => this.get(500, msg)
    this.notImplemented = (msg) => this.get(501, msg)
    this.badGateway = (msg) => this.get(502, msg)
    this.serviceUnavailable = (msg) => this.get(503, msg)
    this.gatewayTimeout = (msg) => this.get(504, msg)
    this.httpVersionNotSupported = (msg) => this.get(505, msg)
    this.insufficientStorage = (msg) => this.get(507, msg)
    this.loopDetected = (msg) => this.get(508, msg)
    this.bandwidthLimitExceeded = (msg) => this.get(509, msg)
    this.notExtended = (msg) => this.get(510, msg)
    this.networkAuthRequired = (msg) => this.get(511, msg)
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
