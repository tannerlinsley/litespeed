import http from 'http'
import { onRequest } from './request'
import validation from './validation'
import { errors } from './errors'

class Airflow {
  /**
   * Creates the server and begins listening.
   * @param {object} opts - Server options
   * @returns {promise} Resolves with the server url
   */
  start () {
    /* create http server and setup request handler */
    const server = http.createServer(onRequest)
    const url = `http://${this.host}:${this.port}`

    server.timeout = this.timeout

    /* returns a promise resolving with the server url */
    return new Promise((resolve, reject) => {
      server.listen(this.port, this.host, () => {
        if (this.logs.server) {
          console.log(`=> Running at ${url}`)
        }
        resolve(url)
      })
    })
  }
}

module.exports = Airflow
module.exports.Errors = errors
module.exports.Validator = validation
