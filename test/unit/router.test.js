import test from 'ava'
import proxyquire from 'proxyquire'
import config from '../../src/config'

const customConfig = { routeMap: { get: {} } }
const router = proxyquire('../../src/router', {
  './config': Object.assign(config, customConfig)
})

test('expandUrl', (t) => {
  t.is(router.expandUrl('/:name'), '^\\/[^\\/]+$')
  t.is(router.expandUrl('/hello/:name'), '^\\/hello\\/[^\\/]+$')
  t.is(router.expandUrl('/hello/:name/:hi'), '^\\/hello\\/[^\\/]+\\/[^\\/]+$')
  t.is(router.expandUrl('/hello/:name:hi'), '^\\/hello\\/[^\\/]+$')
  t.is(router.expandUrl('/hello/:name/test'), '^\\/hello\\/[^\\/]+\\/test$')
  t.is(router.expandUrl('/hello/:name/test/:hi'), '^\\/hello\\/[^\\/]+\\/test\\/[^\\/]+$')
  t.is(router.expandUrl('/hello/.*', false), '^\\/hello\\/.*$')
  t.throws(() => router.expandUrl(), TypeError)
  t.throws(() => router.expandUrl(1), TypeError)
})

test('getSegmentData', (t) => {
  t.deepEqual(router.getSegmentData('/jason', '/:name'), { name: 'jason' })
  t.deepEqual(router.getSegmentData('/name/jason', '/name/:name'), { name: 'jason' })
  t.deepEqual(router.getSegmentData('/name/jason/test/yo', '/name/:name/test/:hi'), { name: 'jason', hi: 'yo' })
  t.deepEqual(router.getSegmentData('/hi/hey', '/:one/:two'), { one: 'hi', two: 'hey' })
  t.deepEqual(router.getSegmentData('/name', '/name'), {})
  t.throws(() => router.getSegmentData(1, '/url'), TypeError)
  t.throws(() => router.getSegmentData('/url', 1), TypeError)
})

test('lookupRoute', (t) => {
  const route1 = { method: 'GET', url: '/' }
  const route2 = { method: 'GET', url: '/hello/:name' }
  const route3 = { method: 'GET', url: '/yo' }
  const routesMap = { get: { '^\\/$': route1, '^\\/hello\\/[^\\/]+$': route2 } }
  t.is(router.lookupRoute({ method: 'GET', url: '/hello/jason' }, routesMap).url, '/hello/:name')
  t.is(router.lookupRoute(route1, routesMap).url, '/')
  t.falsy(router.lookupRoute(route3, routesMap))
})

test('createRoute', (t) => {
  const route = { method: 'GET', url: '/hello/:name', handler: () => {} }
  router.createRoute(route)
  const data = customConfig.routeMap.get['^\\/hello\\/[^\\/]+$']
  t.deepEqual(data, route)
  t.throws(() => router.createRoute(route), Error, 'duplicate route')
  t.throws(() => router.createRoute(), TypeError, 'no config')
  t.throws(() => router.createRoute({ method: 'HI' }), TypeError, 'invalid method')
  t.throws(() => router.createRoute({ method: 'GET' }), TypeError, 'invalid url')
  t.throws(() => router.createRoute({ method: 'GET', url: '/', handler: 'hi' }), TypeError, 'invalid handler')
})
