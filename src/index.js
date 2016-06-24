import http from 'http'
import handler from './utils/handler'
import { getRoutes } from './utils/router'

class Airflow {
  constructor (opts = {}) {
    this.host = opts.host || 'localhost'
    this.port = parseInt(opts.port, 10) || 8000
    this.functions = opts.functions || 'functions/**/*.js'
  }

  start (opts = {}) {
    const routes = getRoutes(this.functions)

    const onRequest = (req, res) => handler(routes, req, res)
    const server = http.createServer(onRequest)

    const uri = `http://${this.host}:${this.port}`
    if (opts.mock) return Promise.resolve(uri)

    return new Promise((resolve, reject) => {
      server.listen(this.port, this.host, () => {
        resolve(uri)
      })
    })
  }
}

module.exports = Airflow
