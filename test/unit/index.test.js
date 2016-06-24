import test from 'ava'
import proxyquire from 'proxyquire'

const Airflow = proxyquire('../../src/index', {
  './utils/router': {
    getRoutes: () => ([])
  }
})

test('Airflow options', (t) => {
  const res = new Airflow()
  t.is(res.host, 'localhost')
  t.is(res.port, 8000)
  t.is(res.functions, 'functions/**/*.js')
  const resWithOpts = new Airflow({ host: 'test.com', port: 7000, functions: 'test/*' })
  t.is(resWithOpts.host, 'test.com')
  t.is(resWithOpts.port, 7000)
  t.is(resWithOpts.functions, 'test/*')
})

test('starts server and returns uri', async (t) => {
  const server = new Airflow()
  t.is(await server.start({ mock: true }), 'http://localhost:8000')
})
