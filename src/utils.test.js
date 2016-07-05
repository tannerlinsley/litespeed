import test from 'ava'
import * as utils from './utils'

test('getIpAddress', (t) => {
  const request1 = { headers: {}, connection: { remoteAddress: '0.0.0.0' } }
  const request2 = { headers: {}, connection: {}, socket: { remoteAddress: '0.0.0.0' } }
  const request3 = { headers: { 'x-forwarded-for': '0.0.0.0' }, connection: {}, socket: {} }
  const request4 = { headers: { 'x-forwarded-for': '0.0.0.0, 1.1.1.1, 2.2.2.2' }, connection: {}, socket: {} }
  t.is(utils.getIpAddress(request1), '0.0.0.0')
  t.is(utils.getIpAddress(request2), '0.0.0.0')
  t.is(utils.getIpAddress(request3), '0.0.0.0')
  t.is(utils.getIpAddress(request4), '0.0.0.0')
})

test('escapeRegex', (t) => {
  t.is(utils.escapeRegex('^.*hello$'), '\\^\\.\\*hello\\$')
  t.is(utils.escapeRegex('test'), 'test')
})
