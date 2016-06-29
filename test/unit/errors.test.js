import test from 'ava'
import { errors, getError, cleanStackTrace } from '../../src/errors'

test('badRequest', (t) => {
  t.deepEqual(errors.badRequest(), { statusCode: 400, error: 'Bad Request' })
  t.deepEqual(errors.badRequest('hey'), { statusCode: 400, error: 'Bad Request', message: 'hey' })
})

test('unauthorized', (t) => {
  t.deepEqual(errors.unauthorized(), { statusCode: 401, error: 'Unauthorized' })
  t.deepEqual(errors.unauthorized('hey'), { statusCode: 401, error: 'Unauthorized', message: 'hey' })
})

test('paymentRequired', (t) => {
  t.deepEqual(errors.paymentRequired(), { statusCode: 402, error: 'Payment Required' })
  t.deepEqual(errors.paymentRequired('hey'), { statusCode: 402, error: 'Payment Required', message: 'hey' })
})

test('forbidden', (t) => {
  t.deepEqual(errors.forbidden(), { statusCode: 403, error: 'Forbidden' })
  t.deepEqual(errors.forbidden('hey'), { statusCode: 403, error: 'Forbidden', message: 'hey' })
})

test('notFound', (t) => {
  t.deepEqual(errors.notFound(), { statusCode: 404, error: 'Not Found' })
  t.deepEqual(errors.notFound('hey'), { statusCode: 404, error: 'Not Found', message: 'hey' })
})

test('methodNotAllowed', (t) => {
  t.deepEqual(errors.methodNotAllowed(), { statusCode: 405, error: 'Method Not Allowed' })
  t.deepEqual(errors.methodNotAllowed('hey'), { statusCode: 405, error: 'Method Not Allowed', message: 'hey' })
})

test('notAcceptable', (t) => {
  t.deepEqual(errors.notAcceptable(), { statusCode: 406, error: 'Not Acceptable' })
  t.deepEqual(errors.notAcceptable('hey'), { statusCode: 406, error: 'Not Acceptable', message: 'hey' })
})

test('proxyAuthRequired', (t) => {
  t.deepEqual(errors.proxyAuthRequired(), { statusCode: 407, error: 'Proxy Authentication Required' })
  t.deepEqual(errors.proxyAuthRequired('hey'), { statusCode: 407, error: 'Proxy Authentication Required', message: 'hey' })
})

test('requestTimeout', (t) => {
  t.deepEqual(errors.requestTimeout(), { statusCode: 408, error: 'Request Timeout' })
  t.deepEqual(errors.requestTimeout('hey'), { statusCode: 408, error: 'Request Timeout', message: 'hey' })
})

test('conflict', (t) => {
  t.deepEqual(errors.conflict(), { statusCode: 409, error: 'Conflict' })
  t.deepEqual(errors.conflict('hey'), { statusCode: 409, error: 'Conflict', message: 'hey' })
})

test('gone', (t) => {
  t.deepEqual(errors.gone(), { statusCode: 410, error: 'Gone' })
  t.deepEqual(errors.gone('hey'), { statusCode: 410, error: 'Gone', message: 'hey' })
})

test('lengthRequired', (t) => {
  t.deepEqual(errors.lengthRequired(), { statusCode: 411, error: 'Length Required' })
  t.deepEqual(errors.lengthRequired('hey'), { statusCode: 411, error: 'Length Required', message: 'hey' })
})

test('preconditionFailed', (t) => {
  t.deepEqual(errors.preconditionFailed(), { statusCode: 412, error: 'Precondition Failed' })
  t.deepEqual(errors.preconditionFailed('hey'), { statusCode: 412, error: 'Precondition Failed', message: 'hey' })
})

test('payloadTooLarge', (t) => {
  t.deepEqual(errors.payloadTooLarge(), { statusCode: 413, error: 'Payload Too Large' })
  t.deepEqual(errors.payloadTooLarge('hey'), { statusCode: 413, error: 'Payload Too Large', message: 'hey' })
})

test('uriTooLong', (t) => {
  t.deepEqual(errors.uriTooLong(), { statusCode: 414, error: 'URI Too Long' })
  t.deepEqual(errors.uriTooLong('hey'), { statusCode: 414, error: 'URI Too Long', message: 'hey' })
})

test('unsupportedMediaType', (t) => {
  t.deepEqual(errors.unsupportedMediaType(), { statusCode: 415, error: 'Unsupported Media Type' })
  t.deepEqual(errors.unsupportedMediaType('hey'), { statusCode: 415, error: 'Unsupported Media Type', message: 'hey' })
})

test('rangeNotSatisfiable', (t) => {
  t.deepEqual(errors.rangeNotSatisfiable(), { statusCode: 416, error: 'Range Not Satisfiable' })
  t.deepEqual(errors.rangeNotSatisfiable('hey'), { statusCode: 416, error: 'Range Not Satisfiable', message: 'hey' })
})

test('expectationFailed', (t) => {
  t.deepEqual(errors.expectationFailed(), { statusCode: 417, error: 'Expectation Failed' })
  t.deepEqual(errors.expectationFailed('hey'), { statusCode: 417, error: 'Expectation Failed', message: 'hey' })
})

test('unprocessableEntity', (t) => {
  t.deepEqual(errors.unprocessableEntity(), { statusCode: 422, error: 'Unprocessable Entity' })
  t.deepEqual(errors.unprocessableEntity('hey'), { statusCode: 422, error: 'Unprocessable Entity', message: 'hey' })
})

test('locked', (t) => {
  t.deepEqual(errors.locked(), { statusCode: 423, error: 'Locked' })
  t.deepEqual(errors.locked('hey'), { statusCode: 423, error: 'Locked', message: 'hey' })
})

test('failedDependency', (t) => {
  t.deepEqual(errors.failedDependency(), { statusCode: 424, error: 'Failed Dependency' })
  t.deepEqual(errors.failedDependency('hey'), { statusCode: 424, error: 'Failed Dependency', message: 'hey' })
})

test('upgradeRequired', (t) => {
  t.deepEqual(errors.upgradeRequired(), { statusCode: 426, error: 'Upgrade Required' })
  t.deepEqual(errors.upgradeRequired('hey'), { statusCode: 426, error: 'Upgrade Required', message: 'hey' })
})

test('preconditionRequired', (t) => {
  t.deepEqual(errors.preconditionRequired(), { statusCode: 428, error: 'Precondition Required' })
  t.deepEqual(errors.preconditionRequired('hey'), { statusCode: 428, error: 'Precondition Required', message: 'hey' })
})

test('tooManyRequests', (t) => {
  t.deepEqual(errors.tooManyRequests(), { statusCode: 429, error: 'Too Many Requests' })
  t.deepEqual(errors.tooManyRequests('hey'), { statusCode: 429, error: 'Too Many Requests', message: 'hey' })
})

test('headersTooLarge', (t) => {
  t.deepEqual(errors.headersTooLarge(), { statusCode: 431, error: 'Request Header Fields Too Large' })
  t.deepEqual(errors.headersTooLarge('hey'), { statusCode: 431, error: 'Request Header Fields Too Large', message: 'hey' })
})

test('legal', (t) => {
  t.deepEqual(errors.legal(), { statusCode: 451, error: 'Unavailable For Legal Reasons' })
  t.deepEqual(errors.legal('hey'), { statusCode: 451, error: 'Unavailable For Legal Reasons', message: 'hey' })
})

test('internal', (t) => {
  t.deepEqual(errors.internal(), { statusCode: 500, error: 'Internal Server Error' })
  t.deepEqual(errors.internal('hey'), { statusCode: 500, error: 'Internal Server Error', message: 'hey' })
})

test('notImplemented', (t) => {
  t.deepEqual(errors.notImplemented(), { statusCode: 501, error: 'Not Implemented' })
  t.deepEqual(errors.notImplemented('hey'), { statusCode: 501, error: 'Not Implemented', message: 'hey' })
})

test('badGateway', (t) => {
  t.deepEqual(errors.badGateway(), { statusCode: 502, error: 'Bad Gateway' })
  t.deepEqual(errors.badGateway('hey'), { statusCode: 502, error: 'Bad Gateway', message: 'hey' })
})

test('serviceUnavailable', (t) => {
  t.deepEqual(errors.serviceUnavailable(), { statusCode: 503, error: 'Service Unavailable' })
  t.deepEqual(errors.serviceUnavailable('hey'), { statusCode: 503, error: 'Service Unavailable', message: 'hey' })
})

test('gatewayTimeout', (t) => {
  t.deepEqual(errors.gatewayTimeout(), { statusCode: 504, error: 'Gateway Timeout' })
  t.deepEqual(errors.gatewayTimeout('hey'), { statusCode: 504, error: 'Gateway Timeout', message: 'hey' })
})

test('httpVersionNotSupported', (t) => {
  t.deepEqual(errors.httpVersionNotSupported(), { statusCode: 505, error: 'HTTP Version Not Supported' })
  t.deepEqual(errors.httpVersionNotSupported('hey'), { statusCode: 505, error: 'HTTP Version Not Supported', message: 'hey' })
})

test('insufficientStorage', (t) => {
  t.deepEqual(errors.insufficientStorage(), { statusCode: 507, error: 'Insufficient Storage' })
  t.deepEqual(errors.insufficientStorage('hey'), { statusCode: 507, error: 'Insufficient Storage', message: 'hey' })
})

test('loopDetected', (t) => {
  t.deepEqual(errors.loopDetected(), { statusCode: 508, error: 'Loop Detected' })
  t.deepEqual(errors.loopDetected('hey'), { statusCode: 508, error: 'Loop Detected', message: 'hey' })
})

test('bandwidthLimitExceeded', (t) => {
  t.deepEqual(errors.bandwidthLimitExceeded(), { statusCode: 509, error: 'Bandwidth Limit Exceeded' })
  t.deepEqual(errors.bandwidthLimitExceeded('hey'), { statusCode: 509, error: 'Bandwidth Limit Exceeded', message: 'hey' })
})

test('notExtended', (t) => {
  t.deepEqual(errors.notExtended(), { statusCode: 510, error: 'Not Extended' })
  t.deepEqual(errors.notExtended('hey'), { statusCode: 510, error: 'Not Extended', message: 'hey' })
})

test('networkAuthRequired', (t) => {
  t.deepEqual(errors.networkAuthRequired(), { statusCode: 511, error: 'Network Authentication Required' })
  t.deepEqual(errors.networkAuthRequired('hey'), { statusCode: 511, error: 'Network Authentication Required', message: 'hey' })
})

test('getError', (t) => {
  t.deepEqual(getError(404), { statusCode: 404, error: 'Not Found' })
  t.deepEqual(getError(500), { statusCode: 500, error: 'Internal Server Error' })
  t.deepEqual(getError(500, 'hi'), { statusCode: 500, error: 'Internal Server Error', message: 'hi' })
  t.deepEqual(getError(600), { statusCode: 600, error: 'Unknown Error' })
})

test('cleanStackTrace', (t) => {
  const stack = 'line1\nline2/node_modules/hi\nline3/node_modules/yo\nline4'
  t.deepEqual(cleanStackTrace({ stack }), { stack: 'line1\nline4' })
  t.deepEqual(cleanStackTrace({ hi: 'hi' }), { hi: 'hi' })
})
