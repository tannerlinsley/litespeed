import http from 'http'

/**
 * All predefined errors
 */
export const errors = {
  badRequest: (msg) => getError(400, msg),
  unauthorized: (msg) => getError(401, msg),
  paymentRequired: (msg) => getError(402, msg),
  forbidden: (msg) => getError(403, msg),
  notFound: (msg) => getError(404, msg),
  methodNotAllowed: (msg) => getError(405, msg),
  notAcceptable: (msg) => getError(406, msg),
  proxyAuthRequired: (msg) => getError(407, msg),
  requestTimeout: (msg) => getError(408, msg),
  conflict: (msg) => getError(409, msg),
  gone: (msg) => getError(410, msg),
  lengthRequired: (msg) => getError(411, msg),
  preconditionFailed: (msg) => getError(412, msg),
  payloadTooLarge: (msg) => getError(413, msg),
  uriTooLong: (msg) => getError(414, msg),
  unsupportedMediaType: (msg) => getError(415, msg),
  rangeNotSatisfiable: (msg) => getError(416, msg),
  expectationFailed: (msg) => getError(417, msg),
  teapot: (msg) => getError(418, msg),
  misdirectedRequest: (msg) => getError(421, msg),
  unprocessableEntity: (msg) => getError(422, msg),
  locked: (msg) => getError(423, msg),
  failedDependency: (msg) => getError(424, msg),
  unorderedCollection: (msg) => getError(425, msg),
  upgradeRequired: (msg) => getError(426, msg),
  preconditionRequired: (msg) => getError(428, msg),
  tooManyRequests: (msg) => getError(429, msg),
  headersTooLarge: (msg) => getError(431, msg),
  legal: (msg) => getError(451, msg),
  internal: (msg) => getError(500, msg),
  notImplemented: (msg) => getError(501, msg),
  badGateway: (msg) => getError(502, msg),
  serviceUnavailable: (msg) => getError(503, msg),
  gatewayTimeout: (msg) => getError(504, msg),
  httpVersionNotSupported: (msg) => getError(505, msg),
  variantAlsoNegotiates: (msg) => getError(506, msg),
  insufficientStorage: (msg) => getError(507, msg),
  loopDetected: (msg) => getError(508, msg),
  bandwidthLimitExceeded: (msg) => getError(509, msg),
  notExtended: (msg) => getError(510, msg),
  networkAuthRequired: (msg) => getError(511, msg)
}

/**
 * Gets an error from predefined Node status codes, and
 * returns a formatted Airflow response.
 * @param {number} statusCode - The status code to lookup/use
 * @param {string} message - An optional response message
 * @return {object} The response object
 */
export function getError (statusCode, message) {
  const err = {
    statusCode,
    error: http.STATUS_CODES[statusCode] || 'Unknown Error'
  }

  if (message) err.message = message

  return err
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
