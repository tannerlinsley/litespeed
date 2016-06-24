import sinon from 'sinon'

export function consoleSpy (t, func = 'log') {
  const spy = sinon.spy()

  t.context[func] = console[func]
  console[func] = t.context[`${func}Spy`] = spy
}
