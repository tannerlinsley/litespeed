import test from 'ava'
import Airflow, { Errors, Validator } from '../../src/index'

test('constructor', (t) => {
  t.is(typeof new Airflow().routes, 'function')
  t.is(typeof new Airflow().start, 'function')
  t.is(typeof Errors, 'function')
  t.is(typeof Validator, 'function')
})
