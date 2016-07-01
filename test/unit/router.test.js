import test from 'ava'
import proxyquire from 'proxyquire'
import config from '../../src/config'

const customConfig = {
  routeMap: {
    get: {
      '^\\/$': { method: 'GET', url: '/' },
      '^\\/hello\\/[^\\/\\?]+$': { method: 'GET', url: '/hello/:name' }
    }
  }
}

const router = proxyquire('../../src/router', {
  './config': Object.assign(config, customConfig)
})

test('expandUrl', (t) => {
  t.is(router.expandUrl('/:name'), '^\\/[^\\/\\?]+$')
  t.is(router.expandUrl('/hello/:name'), '^\\/hello\\/[^\\/\\?]+$')
  t.is(router.expandUrl('/hello/:name/:hi'), '^\\/hello\\/[^\\/\\?]+\\/[^\\/\\?]+$')
  t.is(router.expandUrl('/hello/:name:hi'), '^\\/hello\\/[^\\/\\?]+$')
  t.is(router.expandUrl('/hello/:name/test'), '^\\/hello\\/[^\\/\\?]+\\/test$')
  t.is(router.expandUrl('/hello/:name/test/:hi'), '^\\/hello\\/[^\\/\\?]+\\/test\\/[^\\/\\?]+$')
  t.is(router.expandUrl('/hello/.*', false), '^\\/hello\\/.*$')
  t.throws(() => router.expandUrl(), TypeError)
  t.throws(() => router.expandUrl(1), TypeError)
})

test('getParamData', (t) => {
  t.deepEqual(router.getParamData('/jason', '/:name'), { name: 'jason' })
  t.deepEqual(router.getParamData('/name/jason', '/name/:name'), { name: 'jason' })
  t.deepEqual(router.getParamData('/name/jason/test/yo', '/name/:name/test/:hi'), { name: 'jason', hi: 'yo' })
  t.deepEqual(router.getParamData('/hi/hey', '/:one/:two'), { one: 'hi', two: 'hey' })
  t.deepEqual(router.getParamData('/name', '/name'), {})
  t.throws(() => router.getParamData(1, '/url'), TypeError)
  t.throws(() => router.getParamData('/url', 1), TypeError)
})

test('getQueryData', (t) => {
  t.deepEqual(router.getQueryData({ url: '/hi?test=yo' }), { test: 'yo' })
  t.deepEqual(router.getQueryData({ url: '/hi?test=yo_-!' }), { test: 'yo_-!' })
  t.deepEqual(router.getQueryData({ url: '/hi?test=yo&hi=hey' }), { test: 'yo', hi: 'hey' })
  t.deepEqual(router.getQueryData({ url: '/hi?test' }), { test: '' })
  t.deepEqual(router.getQueryData({ url: '/hi?' }), {})
  t.deepEqual(router.getQueryData({ url: '/hi' }), {})
  t.throws(() => router.getQueryData(), TypeError)
})

test('removeUrlQuery', (t) => {
  t.is(router.removeUrlQuery('/hi?whatup=hey'), '/hi')
  t.is(router.removeUrlQuery('/hi?whatup=hey&test=hi'), '/hi')
  t.is(router.removeUrlQuery('/hi?whatup'), '/hi')
  t.is(router.removeUrlQuery('/hi?'), '/hi')
  t.is(router.removeUrlQuery('/hi'), '/hi')
  t.is(router.removeUrlQuery(), '')
})

test('lookupRoute', (t) => {
  t.is(router.lookupRoute({ method: 'GET', url: '/' }).url, '/')
  t.is(router.lookupRoute({ method: 'GET', url: '/hello/jason' }).url, '/hello/:name')
  t.falsy(router.lookupRoute({ method: 'GET', url: '/yo' }))
  t.falsy(router.lookupRoute({ method: 'GET', url: '/hello/jason?test=hi' }))
})

test('createRoute', (t) => {
  const route = { method: 'GET', url: '/whatup', handler: () => {} }
  router.createRoute(route)
  const data = customConfig.routeMap.get['^\\/whatup$']
  t.deepEqual(data, route)
  t.throws(() => router.createRoute(route), Error, 'duplicate route')
  t.throws(() => router.createRoute(), TypeError, 'no config')
  t.throws(() => router.createRoute({ method: 'HI' }), TypeError, 'invalid method')
  t.throws(() => router.createRoute({ method: 'GET' }), TypeError, 'invalid url')
  t.throws(() => router.createRoute({ method: 'GET', url: '/', handler: 'hi' }), TypeError, 'invalid handler')
})
