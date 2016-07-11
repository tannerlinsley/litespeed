try {
  require('source-map-support').install()
} catch (err) { /* no source map support */ }

import { updateConfig } from './config'
import { createRoute, getAllRoutes } from './router'
import inject from './inject'
// import docs from './docs'
import server from './server'
import Validation from './validation'
import Errors from './errors'

class Litespeed {
  constructor (opts) {
    /* set custom config options */
    updateConfig(opts)

    /**
     * define front-facing API methods
     */

    this.start = async (cb) => {
      // await docs()
      await server(cb)
      return this
    }

    this.route = (route) => {
      createRoute(route)
      return this
    }

    this.routes = (route) => {
      getAllRoutes(route)
      return this
    }

    this.inject = (route) => {
      return inject(route)
    }
  }
}

module.exports = Litespeed
module.exports.Validator = Validation
module.exports.Errors = Errors
