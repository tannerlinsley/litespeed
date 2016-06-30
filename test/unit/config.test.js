import test from 'ava'
import config, { updateConfig } from '../../src/config'

test('config', (t) => {
  process.env.NODE_ENV = 'development'
  t.is(config.name, 'Airflow')
  t.is(config.host, 'localhost')
  t.is(config.port, 8000)
  t.is(config.timeout, 5000)
  t.is(config.payloadLimit, 1048576)
  t.true(config.stripUnknown)
  t.true(config.protect)
  t.is(typeof config.logs, 'object')
  t.is(typeof config.routeMap, 'object')
  t.true(config.isDev())
})

test('updateConfig', (t) => {
  process.env.NODE_ENV = 'production'
  updateConfig({
    name: 'Hi',
    host: '0.0.0.0',
    port: 7000,
    stripUnknown: false,
    protect: false,
    logs: false
  })
  t.is(config.name, 'Hi')
  t.is(config.host, '0.0.0.0')
  t.is(config.port, 7000)
  t.false(config.stripUnknown)
  t.false(config.protect)
  t.false(config.logs.server)
  t.false(config.isDev())
})

test('updateConfig', (t) => {
  process.env.NODE_ENV = 'production'
  updateConfig()
  t.is(config.name, 'Hi')
})

test('updateConfig', (t) => {
  process.env.NODE_ENV = 'production'
  updateConfig({
    logs: { request: false }
  })
  t.false(config.logs.request)
})
