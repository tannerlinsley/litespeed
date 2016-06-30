import test from 'ava'
import stream from 'stream'
import sinon from 'sinon'
import { sendResponse } from '../../src/response'

test('plain text', (t) => {
  const data = 'hi'
  const res = { setHeader: sinon.spy(), end: sinon.spy() }
  sendResponse(res, 201, data)
  t.is(res.statusCode, 201)
  t.is(res.setHeader.callCount, 4)
  t.true(res.end.calledWith(data))
})

test('no response', (t) => {
  const res = { setHeader: sinon.spy(), end: sinon.spy() }
  sendResponse(res, null, { __noResponse: true })
  t.is(res.setHeader.callCount, 4)
  t.true(res.end.calledWith(''))
})

test('no data', (t) => {
  const res = { setHeader: sinon.spy(), end: sinon.spy() }
  sendResponse(res)
  t.is(res.setHeader.callCount, 2)
  t.true(res.end.calledWith())
})

test('buffer', (t) => {
  const data = new Buffer('hi')
  const res = { setHeader: sinon.spy(), end: sinon.spy() }
  sendResponse(res, null, data)
  t.is(res.setHeader.callCount, 4)
  t.true(res.end.calledWith(data))
})

test('stream', (t) => {
  const data = new stream.Stream()
  data.pipe = sinon.spy()
  const res = { setHeader: sinon.spy() }
  sendResponse(res, null, data)
  t.is(res.setHeader.callCount, 3)
  t.true(data.pipe.calledWith(res))
})

test('object', (t) => {
  const data = { hi: 'hi' }
  const res = { setHeader: sinon.spy(), end: sinon.spy() }
  sendResponse(res, null, data)
  t.is(res.setHeader.callCount, 5)
  t.true(res.end.calledWith('{"hi":"hi"}'))
})

test('object (pretty)', (t) => {
  process.env.NODE_ENV = 'development'
  const data = { hi: 'hi' }
  const res = { setHeader: sinon.spy(), end: sinon.spy() }
  sendResponse(res, null, data)
  t.is(res.setHeader.callCount, 5)
  t.true(res.end.calledWith('{\n  "hi": "hi"\n}'))
})
