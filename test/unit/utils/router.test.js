import test from 'ava'
import proxyquire from 'proxyquire'

proxyquire.noCallThru()
const router = proxyquire('../../../src/utils/router', {
  glob: {
    sync: (pattern) => pattern || ['index.js']
  },
  [`${process.cwd()}/single.js`]: { method: 'GET', url: '/', handler () {} },
  [`${process.cwd()}/index.js`]: [
    { method: 'GET', url: '/', handler () {} },
    { method: 'POST', url: '/', handler () {} }
  ],
  [`${process.cwd()}/nested.js`]: [
    [{ method: 'GET', url: '/', handler () {} }],
    [{ method: 'POST', url: '/', handler () {} }]
  ],
  [`${process.cwd()}/nestedDeep.js`]: [
    [[{ method: 'GET', url: '/', handler () {} }]],
    [[{ method: 'POST', url: '/', handler () {} }]]
  ],
  [`${process.cwd()}/duplicate.js`]: [
    { method: 'GET', url: '/', handler () {} },
    { method: 'GET', url: '/', handler () {} }
  ],
  [`${process.cwd()}/duplicateNested.js`]: [
    [{ method: 'GET', url: '/', handler () {} }],
    [{ method: 'GET', url: '/', handler () {} }]
  ]
})

test('fingerprint', (t) => {
  const handler = () => {}
  const base = { method: 'GET', url: '/test', handler }
  t.is(router.fingerprint(base), 'R0VUOi90ZXN0')
  t.is(router.fingerprint({ ...base, method: 'POST' }), 'UE9TVDovdGVzdA==')
  t.throws(() => router.fingerprint(), TypeError)
  t.throws(() => router.fingerprint({ method: 'GET', handler }), TypeError)
  t.throws(() => router.fingerprint({ ...base, method: 'HI' }), Error)
  t.throws(() => router.fingerprint({ ...base, handler: 'yo' }), TypeError)
})

test('getRoutes', (t) => {
  t.deepEqual(router.getRoutes()['R0VUOi8='].method, 'GET')
  t.deepEqual(router.getRoutes()['UE9TVDov'].method, 'POST')
  t.deepEqual(router.getRoutes(['single.js'])['R0VUOi8='].method, 'GET')
  t.deepEqual(router.getRoutes(['nested.js'])['R0VUOi8='].method, 'GET')
  t.deepEqual(router.getRoutes(['nested.js'])['UE9TVDov'].method, 'POST')
  t.deepEqual(router.getRoutes(['nestedDeep.js'])['R0VUOi8='].method, 'GET')
  t.deepEqual(router.getRoutes(['nestedDeep.js'])['UE9TVDov'].method, 'POST')
  t.throws(() => router.getRoutes(['duplicate.js']), Error)
  t.throws(() => router.getRoutes(['duplicateNested.js']), Error)
  t.throws(() => router.getRoutes(['doesnt-exist']), Error)
})
