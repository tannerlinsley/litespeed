import test from 'ava'
import { errors, getError, cleanStackTrace } from '../../../src/utils/errors'

test('errors', (t) => {
  t.deepEqual(errors.notFound(), { statusCode: 404, error: 'Not Found' })
  t.deepEqual(errors.notFound('hey'), { statusCode: 404, error: 'Not Found', message: 'hey' })
  t.deepEqual(errors.internal(), { statusCode: 500, error: 'Internal Server Error' })
  t.deepEqual(errors.internal('hey'), { statusCode: 500, error: 'Internal Server Error', message: 'hey' })
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
