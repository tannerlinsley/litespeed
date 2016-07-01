try {
  require('source-map-support').install()
} catch (err) { /* no source map support */ }

import { updateConfig } from './config'
import { createRoute } from './router'
import inject from './inject'
import server from './server'
import Validation from './validation'
import Errors from './errors'

class Airflow {
  constructor (opts) {
    /* set custom config options */
    updateConfig(opts)

    /* define front-facing API methods */
    this.routes = (route) => {
      createRoute(route)
      return this
    }

    this.start = async (cb) => {
      await server(cb)
      return this
    }

    this.inject = (route) => {
      return inject(route)
    }
  }
}

module.exports = Airflow
module.exports.Validator = Validation
module.exports.Errors = Errors
