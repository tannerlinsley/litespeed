import test from 'ava'
import sinon from 'sinon'
import start from '../../../src/cmds/start'

test('start', async (t) => {
  sinon.stub(console, 'log')
  const res = await start()
  t.is(res, 'http://localhost:8000')
  t.is(console.log.callCount, 3)
  console.log.restore()
})
