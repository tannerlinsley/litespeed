import test from 'ava'
import sinon from 'sinon'
import * as emit from '../../../src/utils/emit'

test('log', (t) => {
  sinon.stub(console, 'log')
  emit.log('testing')
  t.true(console.log.calledWithMatch(/testing/))
  console.log.restore()
})

test('error', (t) => {
  sinon.stub(console, 'error')
  emit.error('oh noes', false)
  t.true(console.error.calledWithMatch(/oh noes/))
  console.error.restore()
})

test('error (throws)', (t) => {
  const stub = sinon.stub(process, 'exit')
  sinon.stub(console, 'error')
  emit.error('oh noes')
  process.exit.restore()
  t.true(console.error.firstCall.calledWithMatch(/oh noes/))
  t.true(stub.firstCall.calledWith(1))
  console.error.restore()
})

test('logo', (t) => {
  sinon.stub(console, 'log')
  emit.logo()
  t.true(console.log.firstCall.calledWith())
  t.true(console.log.secondCall.calledWithMatch(/,\./))
  console.log.restore()
})

test('hideCursor', (t) => {
  const stub = sinon.stub(process.stdout, 'write')
  emit.hideCursor()
  process.stdout.write.restore()
  t.true(stub.firstCall.calledWith('\u001b[?25l'))
})

test('showCursor', (t) => {
  const stub = sinon.stub(process.stdout, 'write')
  emit.showCursor()
  process.stdout.write.restore()
  t.true(stub.firstCall.calledWith('\u001b[?25h'))
})
