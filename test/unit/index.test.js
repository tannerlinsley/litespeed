import test from 'ava'
import sinon from 'sinon'
import proxyquire from 'proxyquire'

const Airflow = proxyquire('../../src/index', {
  './utils/router': {
    getRoutes: () => ([])
  }
})

test('constructor', (t) => {
  const server = new Airflow()
  t.is(server.host, 'localhost')
  t.is(server.port, 8000)
  t.is(server.functions, 'functions/**/*.js')
  const opts = { host: 'test.com', port: 7000, functions: 'test/*' }
  const serverWthOpts = new Airflow(opts)
  t.is(serverWthOpts.host, opts.host)
  t.is(serverWthOpts.port, opts.port)
  t.is(serverWthOpts.functions, opts.functions)
  t.is(typeof Airflow.Errors.notFound, 'function')
})

test('start', async (t) => {
  const server = new Airflow({ port: 7777 })
  t.is(await server.start(), 'http://localhost:7777')
})

test('respond', (t) => {
  const server = new Airflow()
  const respond = { writeHead: sinon.spy(), write: sinon.spy(), end: sinon.spy() }
  server.respond(respond, 201, { response: 'testing' })
  t.true(respond.writeHead.calledWith(201))
  t.is(respond.writeHead.args[0][1].Server, 'Airflow')
  t.is(respond.writeHead.args[0][1]['Content-Length'], 9)
  t.regex(respond.writeHead.args[0][1]['Content-Type'], /application\/json/)
  t.true(respond.write.calledWith('"testing"'))
  t.true(respond.end.calledOnce)
  t.throws(() => server.respond(respond, 200, 'hi'), TypeError)
})

test('respond (blank response)', (t) => {
  const server = new Airflow()
  const respond = { writeHead: sinon.spy(), write: sinon.spy(), end: sinon.spy() }
  server.respond(respond, undefined)
  t.true(respond.writeHead.calledWith(200))
  t.true(respond.write.calledWith('OK'))
})

test('onRequest', async (t) => {
  const server = new Airflow()
  server.routes = { 'R0VUOi8=': { method: 'GET', url: '/', handler: () => 'testing' } }
  server.respond = sinon.spy()
  const request = { ...server.routes['R0VUOi8='], socket: true }
  await server.onRequest(request, {})
  t.true(server.respond.calledWith({}, undefined, { response: 'testing' }))
})

test('onRequest (promise)', async (t) => {
  const server = new Airflow()
  server.routes = { 'R0VUOi8=': { method: 'GET', url: '/', handler: () => Promise.resolve('testing') } }
  server.respond = sinon.spy()
  const request = { ...server.routes['R0VUOi8='], socket: true }
  await server.onRequest(request, {})
  t.true(server.respond.calledWith({}, undefined, { response: 'testing' }))
})

test('onRequest (GET with status code)', async (t) => {
  const server = new Airflow()
  server.routes = { 'R0VUOi8=': { method: 'GET', statusCode: 201, url: '/', handler: () => Promise.resolve('testing') } }
  server.respond = sinon.spy()
  const request = { ...server.routes['R0VUOi8='], socket: true }
  await server.onRequest(request, {})
  t.true(server.respond.calledWith({}, 201, { response: 'testing' }))
})

test('onRequest (with rejected promise)', async (t) => {
  const server = new Airflow()
  server.routes = { 'R0VUOi8=': { method: 'GET', url: '/', handler: () => Promise.reject('oh no') } }
  server.respond = sinon.spy()
  sinon.stub(console, 'error')
  const request = { ...server.routes['R0VUOi8='], socket: true }
  await server.onRequest(request, {})
  const err = { response: { statusCode: 500, error: 'Internal Server Error' } }
  t.true(server.respond.calledWith({}, 500, err))
  t.true(console.error.firstCall.calledWith(new Error('oh no')))
  console.error.restore()
})

test('onRequest (with rejected promise in dev mode)', async (t) => {
  process.env.NODE_ENV = 'dev'
  const server = new Airflow()
  server.routes = { 'R0VUOi8=': { method: 'GET', url: '/', handler: () => Promise.reject('oh no') } }
  server.respond = sinon.spy()
  sinon.stub(console, 'error')
  const request = { ...server.routes['R0VUOi8='], socket: true }
  await server.onRequest(request, {})
  const err = { response: { statusCode: 500, error: 'Internal Server Error', message: 'oh no' } }
  t.true(server.respond.calledWith({}, 500, err))
  console.error.restore()
  process.env.NODE_ENV = 'testing'
})

test('onRequest (with returned airflow error)', async (t) => {
  const server = new Airflow()
  server.routes = { 'R0VUOi8=': { method: 'GET', url: '/', handler: () => Airflow.Errors.notFound('ohno') } }
  server.respond = sinon.spy()
  const request = { ...server.routes['R0VUOi8='], socket: true }
  await server.onRequest(request, {})
  const err = { response: { statusCode: 404, error: 'Not Found', message: 'ohno' } }
  t.true(server.respond.calledWith({}, 404, err))
})

test('onRequest (with rejected promise airflow error)', async (t) => {
  const server = new Airflow()
  server.routes = { 'R0VUOi8=': { method: 'GET', url: '/', handler: () => Promise.reject(Airflow.Errors.notFound('ohno')) } }
  server.respond = sinon.spy()
  const request = { ...server.routes['R0VUOi8='], socket: true }
  await server.onRequest(request, {})
  const err = { response: { statusCode: 404, error: 'Not Found', message: 'ohno' } }
  t.true(server.respond.calledWith({}, 404, err))
})

test('onRequest (with airflow server error)', async (t) => {
  const server = new Airflow()
  server.routes = { 'R0VUOi8=': { method: 'GET', url: '/', handler: () => Airflow.Errors.internal('ohno') } }
  server.respond = sinon.spy()
  sinon.stub(console, 'error')
  const request = { ...server.routes['R0VUOi8='], socket: true }
  await server.onRequest(request, {})
  const err = { response: { statusCode: 500, error: 'Internal Server Error' } }
  t.true(server.respond.calledWith({}, 500, err))
  console.error.restore()
})

test('onRequest (with airflow server error in dev mode)', async (t) => {
  process.env.NODE_ENV = 'dev'
  const server = new Airflow()
  server.routes = { 'R0VUOi8=': { method: 'GET', url: '/', handler: () => Airflow.Errors.internal('ohno') } }
  server.respond = sinon.spy()
  sinon.stub(console, 'error')
  const request = { ...server.routes['R0VUOi8='], socket: true }
  await server.onRequest(request, {})
  const err = { response: { statusCode: 500, error: 'Internal Server Error', message: 'ohno' } }
  t.true(server.respond.calledWith({}, 500, err))
  console.error.restore()
  process.env.NODE_ENV = 'testing'
})

test('onRequest (with Error object)', async (t) => {
  const server = new Airflow()
  const error = new Error('ohno')
  server.routes = { 'R0VUOi8=': { method: 'GET', url: '/', handler: () => error } }
  server.respond = sinon.spy()
  sinon.stub(console, 'error')
  const request = { ...server.routes['R0VUOi8='], socket: true }
  await server.onRequest(request, {})
  const err = { response: { statusCode: 500, error: 'Internal Server Error' } }
  t.true(server.respond.calledWith({}, 500, err))
  t.true(console.error.firstCall.calledWith(error))
  console.error.restore()
})

test('onRequest (with rejected promise Error object)', async (t) => {
  const server = new Airflow()
  const error = new Error('ohno')
  server.routes = { 'R0VUOi8=': { method: 'GET', url: '/', handler: () => Promise.reject(error) } }
  server.respond = sinon.spy()
  sinon.stub(console, 'error')
  const request = { ...server.routes['R0VUOi8='], socket: true }
  await server.onRequest(request, {})
  const err = { response: { statusCode: 500, error: 'Internal Server Error' } }
  t.true(server.respond.calledWith({}, 500, err))
  t.true(console.error.firstCall.calledWith(error))
  console.error.restore()
})

test('onRequest (with rejected promise Error object in dev mode)', async (t) => {
  process.env.NODE_ENV = 'dev'
  const server = new Airflow()
  const error = new Error('ohno')
  server.routes = { 'R0VUOi8=': { method: 'GET', url: '/', handler: () => Promise.reject(error) } }
  server.respond = sinon.spy()
  sinon.stub(console, 'error')
  const request = { ...server.routes['R0VUOi8='], socket: true }
  await server.onRequest(request, {})
  const err = { response: { statusCode: 500, error: 'Internal Server Error', message: 'ohno' } }
  t.true(server.respond.calledWith({}, 500, err))
  t.true(console.error.firstCall.calledWith(error))
  console.error.restore()
  process.env.NODE_ENV = 'testing'
})

test('onRequest (not found)', async (t) => {
  const server = new Airflow()
  server.respond = sinon.spy()
  const request = { method: 'GET', url: '/', socket: true }
  await server.onRequest(request, {})
  const err = { response: { statusCode: 404, error: 'Not Found' } }
  t.true(server.respond.calledWith({}, 404, err))
})
