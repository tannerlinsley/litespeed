import test from 'ava'
import Airflow from '../../src/index'

const server = new Airflow()

test('constructor', (t) => {
  t.is(server.host, 'localhost')
  t.is(server.port, 8000)
  t.is(typeof Airflow.Errors, 'object')
  t.is(typeof Airflow.Validator, 'function')
})
