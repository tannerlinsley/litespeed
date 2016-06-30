try {
  require('source-map-support').install()
} catch (err) { /* no source map support */ }

import server from './server'
import { updateConfig } from './config'
import { createRoute } from './router'
import Validation from './validation'
import Errors from './errors'

class Airflow {
  constructor (opts) {
    /* set custom config options */
    updateConfig(opts)

    /* define front-facing API methods */
    this.routes = createRoute
    this.start = server
  }
}

module.exports = Airflow
module.exports.Validator = Validation
module.exports.Errors = Errors
