import test from 'ava'
import * as router from '../../src/router'

test('parseRoute', (t) => {
  const config = { method: 'GET', url: '/hello/:name', handler: () => {} }
  const routeMap = { routes: { get: {} } }
  const route = router.parseRoute(config, routeMap)
  t.is(route.method, 'get')
  t.is(route.splatter.url, '/hello/:name')
  t.is(route.splatter.splat, '/hello/*')
  t.deepEqual(route.route, config)
  t.throws(() => router.parseRoute(config, { routes: { get: { '/hello/:name': config } } }), Error, 'duplicate route')
  t.throws(() => router.parseRoute(), TypeError, 'no config')
  t.throws(() => router.parseRoute({ method: 'HI' }), TypeError, 'invalid method')
  t.throws(() => router.parseRoute({ method: 'GET' }), TypeError, 'invalid url')
  t.throws(() => router.parseRoute({ method: 'GET', url: '/', handler: 'hi' }), TypeError, 'invalid handler')
})

test('lookupRoute', (t) => {
  const route1 = { method: 'GET', url: '/hello/:name', handler: () => {} }
  const route2 = { method: 'GET', url: '/hi', handler: () => {} }
  const route3 = { method: 'GET', url: '/yo', handler: () => {} }
  const routesMap = { routes: { get: { '/hello/*': route1, '/hi': route2 } } }
  t.is(router.lookupRoute(route1, routesMap).url, '/hello/:name')
  t.is(router.lookupRoute(route2, routesMap).url, '/hi')
  t.falsy(router.lookupRoute(route3, routesMap))
})

test('splatter', (t) => {
  t.deepEqual(router.getSplat('/'), { url: '/', splat: '/' })
  t.deepEqual(router.getSplat('/:value'), { url: '/:value', splat: '/*' })
  t.deepEqual(router.getSplat('/test/:value'), { url: '/test/:value', splat: '/test/*' })
  t.deepEqual(router.getSplat('/test/:value/yo/:hey'), { url: '/test/:value/yo/:hey', splat: '/test/*/yo/*' })
  t.deepEqual(router.getSplat('/test/:value/:hey'), { url: '/test/:value/:hey', splat: '/test/*/*' })
  t.deepEqual(router.getSplat('/test/:value:hey'), { url: '/test/:value:hey', splat: '/test/*' })
  t.throws(() => router.getSplat(), TypeError)
  t.throws(() => router.getSplat(1), TypeError)
})

test('getSegmentData', (t) => {
  t.deepEqual(router.getSegmentData('/jason', { splat: '/*', url: '/:name' }), { name: 'jason' })
  t.deepEqual(router.getSegmentData('/name/jason', { splat: '/name/*', url: '/name/:name' }), { name: 'jason' })
  t.deepEqual(router.getSegmentData('/hi/hey', { splat: '/*/*', url: '/:one/:two' }), { one: 'hi', two: 'hey' })
  t.deepEqual(router.getSegmentData('/name', { splat: '/name', url: '/name' }), {})
  t.throws(() => router.getSegmentData(1, {}), TypeError)
  t.throws(() => router.getSegmentData('/url', 'hi'), TypeError)
})
