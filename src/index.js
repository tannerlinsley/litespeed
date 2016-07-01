try {
  require('source-map-support').install()
} catch (err) { /* no source map support */ }

import { updateConfig } from './config'
import { createRoute } from './router'
import server from './server'
import Validation from './validation'
import Errors from './errors'

class Airflow {
  constructor (opts) {
    /* set custom config options */
    updateConfig(opts)

    /* define front-facing API methods */
    this.routes = (config) => {
      createRoute(config)
      return this
    }
    this.start = () => {
      server()
      return this
    }
  }
}

module.exports = Airflow
module.exports.Validator = Validation
module.exports.Errors = Errors
