import test from 'ava'
import config, { updateConfig } from './config'

test('config', (t) => {
  process.env.NODE_ENV = 'development'
  t.is(config.name, 'Litespeed')
  t.is(config.host, '0.0.0.0')
  t.is(config.port, 8000)
  t.true(config.stripUnknown)
  t.is(typeof config.logs, 'object')
  t.is(typeof config._routeMap, 'object')
  t.true(config._isDev())
})

test('updateConfig', (t) => {
  process.env.NODE_ENV = 'production'
  updateConfig({
    name: 'Hi',
    host: '0.0.0.0',
    port: 7000,
    stripUnknown: false,
    logs: false
  })
  t.is(config.name, 'Hi')
  t.is(config.host, '0.0.0.0')
  t.is(config.port, 7000)
  t.false(config.stripUnknown)
  t.false(config.logs)
  t.false(config._isDev())
  updateConfig() // with no object
  t.is(config.name, 'Hi')
})

test('updateConfig (errors)', (t) => {
  t.throws(() => updateConfig({ _isDev: 'hi' }), Error)
  t.throws(() => updateConfig({ whatup: 'hi' }), Error)
  t.throws(() => updateConfig({ port: '12345' }), TypeError)
})
