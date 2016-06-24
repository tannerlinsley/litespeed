import path from 'path'
import glob from 'glob'

/**
 * Fingerprints a route for lookup later.
 * @param {object} route - The airflow route object
 * @returns The encoded string
 */
export function fingerprint (route) {
  if (typeof route !== 'object') {
    throw new TypeError('Function must be an object')
  }
  if (!route.method.match(/^(get|post|put|delete)$/i)) {
    throw new Error('Method must be one of: GET, POST, PUT, DELETE')
  }
  if (typeof route.url !== 'string') {
    throw new TypeError('URL must be a string')
  }
  if (typeof route.handler !== 'function') {
    throw new TypeError('Handler must be a function!')
  }

  const str = `${route.method}:${route.url}`
  return new Buffer(str).toString('base64')
}

/**
 * Gets each route, ensures uniqueness, and fingerprints it.
 * Takes into account nested arrays, however deep.
 * @param {string} file - The main file that exports an array of routes
 * @return {object} The parsed routes
 */
export function getRoutes (pattern) {
  const parsed = {}

  const files = glob.sync(pattern, { nodir: true })
  files.forEach((file) => {
    let routes = require(path.resolve(file))
    if (!Array.isArray(routes)) routes = [routes] // makes things simpler

    const walk = (arr) => {
      arr.forEach((route) => {
        if (Array.isArray(route)) {
          return walk(route)
        }

        const print = fingerprint(route)
        if (parsed[print]) {
          throw new Error(`"${route.method} ${route.url}" is defined more than once!`)
        }

        parsed[print] = route
      })
    }

    walk(routes)
  })

  return parsed
}
