import test from 'ava'
import sinon from 'sinon'
import proxyquire from 'proxyquire'
import config from '../../src/config'

const log = { server: true }
const server = proxyquire('../../src/server', {
  'http': {
    createServer: () => ({ listen: (_, __, cb) => cb() })
  },
  './config': Object.assign(config, { log })
}).default

test('start', async (t) => {
  sinon.stub(console, 'log')
  t.regex(await server(), /localhost/)
  t.true(console.log.firstCall.calledWithMatch(/localhost/))
  console.log.restore()
})

test('start (no logging)', async (t) => {
  log.server = false
  sinon.stub(console, 'log')
  t.regex(await server(), /localhost/)
  t.false(console.log.called)
  console.log.restore()
})
