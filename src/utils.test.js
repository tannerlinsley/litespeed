import test from 'ava'
import proxyquire from 'proxyquire'
import * as utils from './utils'

test('getIpAddress', (t) => {
  const request1 = { headers: {}, connection: { remoteAddress: '0.0.0.0' } }
  const request2 = { headers: {}, connection: {}, socket: { remoteAddress: '0.0.0.0' } }
  t.is(utils.getIpAddress(request1), '0.0.0.0')
  t.is(utils.getIpAddress(request2), '0.0.0.0')
})

test('getIpAddress', (t) => {
  const { getIpAddress } = proxyquire('./utils', {
    './config': { realIp: true, '@noCallThru': true }
  })
  const request1 = { headers: { 'x-forwarded-for': '0.0.0.0' }, connection: {}, socket: {} }
  const request2 = { headers: { 'x-forwarded-for': '0.0.0.0, 1.1.1.1, 2.2.2.2' }, connection: {}, socket: {} }
  t.is(getIpAddress(request1), '0.0.0.0')
  t.is(getIpAddress(request2), '0.0.0.0')
})

test('escapeRegex', (t) => {
  t.is(utils.escapeRegex('^.*hello$'), '\\^\\.\\*hello\\$')
  t.is(utils.escapeRegex('test'), 'test')
})

test('typeOf', (t) => {
  t.is(utils.typeOf('hello'), 'string')
  t.is(utils.typeOf([1, 2, 3]), 'array')
  t.is(utils.typeOf({ one: 1, two: 2 }), 'object')
  t.is(utils.typeOf('{ "one": 1, "two": 2 }'), 'string')
  t.is(utils.typeOf(Object.create({})), 'object')
  t.is(utils.typeOf(100), 'number')
  t.is(utils.typeOf(1.111), 'number')
  t.is(utils.typeOf(true), 'boolean')
  t.is(utils.typeOf(), 'undefined')
})

test('promiseWaterfall', async (t) => {
  const res = []
  const run = (id = 0) => new Promise((resolve) => {
    setTimeout(() => (res.push(id) && resolve(++id)), Math.random() * 100)
  })
  const chain = Array.from({ length: 4 }, () => run)
  t.is(await utils.promiseWaterfall(chain), 4)
  t.deepEqual(res, [0, 1, 2, 3])
  t.falsy(await utils.promiseWaterfall())
  await t.throws(() => utils.promiseWaterfall('hi'), TypeError)
})
