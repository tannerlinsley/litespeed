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
    './config': { behindProxy: true, '@noCallThru': true }
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
