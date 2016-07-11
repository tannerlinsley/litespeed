import test from 'ava'
import proxyquire from 'proxyquire'
import Validator from './validation'
import * as request from './request'

/* functions */
test.todo('onRequest')
test.todo('onError')
test.todo('getBodyData')

/* situations */
test.todo('return Error from handler')
test.todo('throw Error in handler')
test.todo('throw string in handler')
test.todo('throw Litespeed error in handler')
test.todo('return Litespeed error in handler')
test.todo('return string from handler')
test.todo('return buffer from handler')
test.todo('return stream from handler')
test.todo('return nothing from handler')
test.todo('all above situations but with promises')
test.todo('handler timeout')

test.todo('runValidations (deep)')
test('runValidations (passed)', async (t) => {
  const route = { validate: { body: { email: new Validator().isEmail() } } }
  const data = { body: { email: 'j@maur.co' } }
  await t.notThrows(request.runValidations(route, data))
})

test('runValidations (failed)', async (t) => {
  const route = {
    validate: {
      body: { email: new Validator().isEmail() },
      query: { test: new Validator().required() },
      params: { test: new Validator().required() },
      headers: { test: new Validator().required() }
    }
  }
  const data = {
    body: { email: 'jmaur.co' },
    query: {}, params: {}, headers: {}
  }
  const err = await t.throws(request.runValidations(route, data))
  t.is(err.statusCode, 400)
  t.regex(err.message, /validation/)
  t.is(err.validation.length, 4)
})

test.todo('stripUnknownData (deep)')
test('stripUnknownData', (t) => {
  const data = { one: 1, two: 2, three: 3 }
  const validations = { one: true, three: true }
  t.deepEqual(request.stripUnknownData(data, validations), { one: 1, three: 3 })
  t.deepEqual(request.stripUnknownData(data, {}), data)
  t.deepEqual(request.stripUnknownData(data), data)
})

test('stripUnknownData (no strip)', (t) => {
  const { stripUnknownData } = proxyquire('./request', {
    './config': { stripUnknown: false, '@noCallThru': true }
  })
  const data = { one: 1, two: 2, three: 3 }
  const validations = { one: true, three: true }
  t.deepEqual(stripUnknownData(data, validations), data)
})
