import test from 'ava'
import Lightrail, { Errors, Validator } from './index'

test('constructor', (t) => {
  t.is(typeof new Lightrail().routes, 'function')
  t.is(typeof new Lightrail().start, 'function')
  t.is(typeof Errors, 'function')
  t.is(typeof Validator, 'function')
})
