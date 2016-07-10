import test from 'ava'
import Errors, { cleanStackTrace } from './errors'

test('constructor', (t) => {
  t.deepEqual(new Errors(404), { statusCode: 404, error: 'Not Found' })
  t.deepEqual(new Errors(500), { statusCode: 500, error: 'Internal Server Error' })
  t.deepEqual(new Errors(500, 'hi'), { statusCode: 500, error: 'Internal Server Error', message: 'hi' })
  t.deepEqual(new Errors(600), { statusCode: 600, error: 'Unknown Error' })
})

test('get', (t) => {
  t.deepEqual(new Errors().get(404), { statusCode: 404, error: 'Not Found' })
  t.deepEqual(new Errors().get(500), { statusCode: 500, error: 'Internal Server Error' })
  t.deepEqual(new Errors().get(500, 'hi'), { statusCode: 500, error: 'Internal Server Error', message: 'hi' })
  t.deepEqual(new Errors().get(600), { statusCode: 600, error: 'Unknown Error' })
})

test('cleanStackTrace', (t) => {
  const stack = 'line1\nline2/node_modules/hi\nline3/node_modules/yo\nline4'
  t.deepEqual(cleanStackTrace({ stack }), { stack: 'line1\nline4' })
  t.deepEqual(cleanStackTrace({ hi: 'hi' }), { hi: 'hi' })
})

// -----------------------------------------------------------------------------
// error types
// -----------------------------------------------------------------------------

test('badRequest', (t) => {
  t.deepEqual(new Errors().badRequest(), { statusCode: 400, error: 'Bad Request' })
  t.deepEqual(new Errors().badRequest('hey'), { statusCode: 400, error: 'Bad Request', message: 'hey' })
})

test('unauthorized', (t) => {
  t.deepEqual(new Errors().unauthorized(), { statusCode: 401, error: 'Unauthorized' })
  t.deepEqual(new Errors().unauthorized('hey'), { statusCode: 401, error: 'Unauthorized', message: 'hey' })
})

test('paymentRequired', (t) => {
  t.deepEqual(new Errors().paymentRequired(), { statusCode: 402, error: 'Payment Required' })
  t.deepEqual(new Errors().paymentRequired('hey'), { statusCode: 402, error: 'Payment Required', message: 'hey' })
})

test('forbidden', (t) => {
  t.deepEqual(new Errors().forbidden(), { statusCode: 403, error: 'Forbidden' })
  t.deepEqual(new Errors().forbidden('hey'), { statusCode: 403, error: 'Forbidden', message: 'hey' })
})

test('notFound', (t) => {
  t.deepEqual(new Errors().notFound(), { statusCode: 404, error: 'Not Found' })
  t.deepEqual(new Errors().notFound('hey'), { statusCode: 404, error: 'Not Found', message: 'hey' })
})

test('methodNotAllowed', (t) => {
  t.deepEqual(new Errors().methodNotAllowed(), { statusCode: 405, error: 'Method Not Allowed' })
  t.deepEqual(new Errors().methodNotAllowed('hey'), { statusCode: 405, error: 'Method Not Allowed', message: 'hey' })
})

test('notAcceptable', (t) => {
  t.deepEqual(new Errors().notAcceptable(), { statusCode: 406, error: 'Not Acceptable' })
  t.deepEqual(new Errors().notAcceptable('hey'), { statusCode: 406, error: 'Not Acceptable', message: 'hey' })
})

test('proxyAuthRequired', (t) => {
  t.deepEqual(new Errors().proxyAuthRequired(), { statusCode: 407, error: 'Proxy Authentication Required' })
  t.deepEqual(new Errors().proxyAuthRequired('hey'), { statusCode: 407, error: 'Proxy Authentication Required', message: 'hey' })
})

test('requestTimeout', (t) => {
  t.deepEqual(new Errors().requestTimeout(), { statusCode: 408, error: 'Request Timeout' })
  t.deepEqual(new Errors().requestTimeout('hey'), { statusCode: 408, error: 'Request Timeout', message: 'hey' })
})

test('conflict', (t) => {
  t.deepEqual(new Errors().conflict(), { statusCode: 409, error: 'Conflict' })
  t.deepEqual(new Errors().conflict('hey'), { statusCode: 409, error: 'Conflict', message: 'hey' })
})

test('gone', (t) => {
  t.deepEqual(new Errors().gone(), { statusCode: 410, error: 'Gone' })
  t.deepEqual(new Errors().gone('hey'), { statusCode: 410, error: 'Gone', message: 'hey' })
})

test('lengthRequired', (t) => {
  t.deepEqual(new Errors().lengthRequired(), { statusCode: 411, error: 'Length Required' })
  t.deepEqual(new Errors().lengthRequired('hey'), { statusCode: 411, error: 'Length Required', message: 'hey' })
})

test('preconditionFailed', (t) => {
  t.deepEqual(new Errors().preconditionFailed(), { statusCode: 412, error: 'Precondition Failed' })
  t.deepEqual(new Errors().preconditionFailed('hey'), { statusCode: 412, error: 'Precondition Failed', message: 'hey' })
})

test('payloadTooLarge', (t) => {
  t.deepEqual(new Errors().payloadTooLarge(), { statusCode: 413, error: 'Payload Too Large' })
  t.deepEqual(new Errors().payloadTooLarge('hey'), { statusCode: 413, error: 'Payload Too Large', message: 'hey' })
})

test('uriTooLong', (t) => {
  t.deepEqual(new Errors().uriTooLong(), { statusCode: 414, error: 'URI Too Long' })
  t.deepEqual(new Errors().uriTooLong('hey'), { statusCode: 414, error: 'URI Too Long', message: 'hey' })
})

test('unsupportedMediaType', (t) => {
  t.deepEqual(new Errors().unsupportedMediaType(), { statusCode: 415, error: 'Unsupported Media Type' })
  t.deepEqual(new Errors().unsupportedMediaType('hey'), { statusCode: 415, error: 'Unsupported Media Type', message: 'hey' })
})

test('rangeNotSatisfiable', (t) => {
  t.deepEqual(new Errors().rangeNotSatisfiable(), { statusCode: 416, error: 'Range Not Satisfiable' })
  t.deepEqual(new Errors().rangeNotSatisfiable('hey'), { statusCode: 416, error: 'Range Not Satisfiable', message: 'hey' })
})

test('expectationFailed', (t) => {
  t.deepEqual(new Errors().expectationFailed(), { statusCode: 417, error: 'Expectation Failed' })
  t.deepEqual(new Errors().expectationFailed('hey'), { statusCode: 417, error: 'Expectation Failed', message: 'hey' })
})

test('unprocessableEntity', (t) => {
  t.deepEqual(new Errors().unprocessableEntity(), { statusCode: 422, error: 'Unprocessable Entity' })
  t.deepEqual(new Errors().unprocessableEntity('hey'), { statusCode: 422, error: 'Unprocessable Entity', message: 'hey' })
})

test('locked', (t) => {
  t.deepEqual(new Errors().locked(), { statusCode: 423, error: 'Locked' })
  t.deepEqual(new Errors().locked('hey'), { statusCode: 423, error: 'Locked', message: 'hey' })
})

test('failedDependency', (t) => {
  t.deepEqual(new Errors().failedDependency(), { statusCode: 424, error: 'Failed Dependency' })
  t.deepEqual(new Errors().failedDependency('hey'), { statusCode: 424, error: 'Failed Dependency', message: 'hey' })
})

test('upgradeRequired', (t) => {
  t.deepEqual(new Errors().upgradeRequired(), { statusCode: 426, error: 'Upgrade Required' })
  t.deepEqual(new Errors().upgradeRequired('hey'), { statusCode: 426, error: 'Upgrade Required', message: 'hey' })
})

test('preconditionRequired', (t) => {
  t.deepEqual(new Errors().preconditionRequired(), { statusCode: 428, error: 'Precondition Required' })
  t.deepEqual(new Errors().preconditionRequired('hey'), { statusCode: 428, error: 'Precondition Required', message: 'hey' })
})

test('tooManyRequests', (t) => {
  t.deepEqual(new Errors().tooManyRequests(), { statusCode: 429, error: 'Too Many Requests' })
  t.deepEqual(new Errors().tooManyRequests('hey'), { statusCode: 429, error: 'Too Many Requests', message: 'hey' })
})

test('headersTooLarge', (t) => {
  t.deepEqual(new Errors().headersTooLarge(), { statusCode: 431, error: 'Request Header Fields Too Large' })
  t.deepEqual(new Errors().headersTooLarge('hey'), { statusCode: 431, error: 'Request Header Fields Too Large', message: 'hey' })
})

test('internal', (t) => {
  t.deepEqual(new Errors().internal(), { statusCode: 500, error: 'Internal Server Error' })
  t.deepEqual(new Errors().internal('hey'), { statusCode: 500, error: 'Internal Server Error', message: 'hey' })
})

test('notImplemented', (t) => {
  t.deepEqual(new Errors().notImplemented(), { statusCode: 501, error: 'Not Implemented' })
  t.deepEqual(new Errors().notImplemented('hey'), { statusCode: 501, error: 'Not Implemented', message: 'hey' })
})

test('badGateway', (t) => {
  t.deepEqual(new Errors().badGateway(), { statusCode: 502, error: 'Bad Gateway' })
  t.deepEqual(new Errors().badGateway('hey'), { statusCode: 502, error: 'Bad Gateway', message: 'hey' })
})

test('serviceUnavailable', (t) => {
  t.deepEqual(new Errors().serviceUnavailable(), { statusCode: 503, error: 'Service Unavailable' })
  t.deepEqual(new Errors().serviceUnavailable('hey'), { statusCode: 503, error: 'Service Unavailable', message: 'hey' })
})

test('gatewayTimeout', (t) => {
  t.deepEqual(new Errors().gatewayTimeout(), { statusCode: 504, error: 'Gateway Timeout' })
  t.deepEqual(new Errors().gatewayTimeout('hey'), { statusCode: 504, error: 'Gateway Timeout', message: 'hey' })
})

test('httpVersionNotSupported', (t) => {
  t.deepEqual(new Errors().httpVersionNotSupported(), { statusCode: 505, error: 'HTTP Version Not Supported' })
  t.deepEqual(new Errors().httpVersionNotSupported('hey'), { statusCode: 505, error: 'HTTP Version Not Supported', message: 'hey' })
})

test('insufficientStorage', (t) => {
  t.deepEqual(new Errors().insufficientStorage(), { statusCode: 507, error: 'Insufficient Storage' })
  t.deepEqual(new Errors().insufficientStorage('hey'), { statusCode: 507, error: 'Insufficient Storage', message: 'hey' })
})

test('loopDetected', (t) => {
  t.deepEqual(new Errors().loopDetected(), { statusCode: 508, error: 'Loop Detected' })
  t.deepEqual(new Errors().loopDetected('hey'), { statusCode: 508, error: 'Loop Detected', message: 'hey' })
})

test('bandwidthLimitExceeded', (t) => {
  t.deepEqual(new Errors().bandwidthLimitExceeded(), { statusCode: 509, error: 'Bandwidth Limit Exceeded' })
  t.deepEqual(new Errors().bandwidthLimitExceeded('hey'), { statusCode: 509, error: 'Bandwidth Limit Exceeded', message: 'hey' })
})

test('notExtended', (t) => {
  t.deepEqual(new Errors().notExtended(), { statusCode: 510, error: 'Not Extended' })
  t.deepEqual(new Errors().notExtended('hey'), { statusCode: 510, error: 'Not Extended', message: 'hey' })
})

test('networkAuthRequired', (t) => {
  t.deepEqual(new Errors().networkAuthRequired(), { statusCode: 511, error: 'Network Authentication Required' })
  t.deepEqual(new Errors().networkAuthRequired('hey'), { statusCode: 511, error: 'Network Authentication Required', message: 'hey' })
})
