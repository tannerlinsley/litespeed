import test from 'ava'
import Litespeed, { Errors, Validator } from './index'

test('constructor', (t) => {
  t.is(typeof new Litespeed().start, 'function')
  t.is(typeof new Litespeed().route, 'function')
  t.is(typeof new Litespeed().routes, 'function')
  t.is(typeof new Litespeed().inject, 'function')
  t.is(typeof Errors, 'function')
  t.is(typeof Validator, 'function')
})
