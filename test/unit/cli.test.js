import test from 'ava'
import sinon from 'sinon'
import proxyquire from 'proxyquire'

let startSpy = sinon.spy()
const cli = proxyquire('../../src/cli', {
  './cmds/start': { default: startSpy }
})

test('start', async (t) => {
  process.argv = [null, null, 'start']
  await cli.default()
  t.true(startSpy.called)
})

test('invalid command', async (t) => {
  process.argv = [null, null, 'abiufowbeof']
  const stub = sinon.stub(process, 'exit')
  sinon.stub(console, 'error')
  await cli.default()
  process.exit.restore()
  t.true(console.error.firstCall.calledWithMatch(/not an Airflow command/))
  t.true(stub.firstCall.calledWith(1))
  console.error.restore()
})

test('error in subcommand', async (t) => {
  const cliTmp = proxyquire('../../src/cli', {
    './cmds/start': { default: sinon.stub().throws('mayday') }
  })
  process.argv = [null, null, 'start']
  const stub = sinon.stub(process, 'exit')
  sinon.stub(console, 'error')
  await cliTmp.default()
  process.exit.restore()
  t.true(console.error.firstCall.calledWithMatch(/mayday/))
  t.true(stub.firstCall.calledWith(1))
  console.error.restore()
})
