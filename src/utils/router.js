import path from 'path'
import glob from 'glob'

/**
 * Fingerprints a route for easy lookup from a routes map.
 * When a request comes in, it is fingerprinted and looked up in the map.
 * @param {object} route - The airflow route object
 * @returns The encoded string
 */
export function fingerprint (route) {
  if (typeof route !== 'object') {
    throw new TypeError('Function must be an object')
  }

  if (!route.method.match(/^(get|post|put|patch|delete)$/i)) {
    throw new Error('Method must be one of: GET, POST, PUT, PATCH, DELETE')
  }
  if (typeof route.url !== 'string') {
    throw new TypeError('URL must be a string')
  }

  /* makes sure there is a handler if we are parsing an airflow route */
  /* !route.socket will be true if it is an incoming request */
  if (!route.socket && typeof route.handler !== 'function') {
    throw new TypeError('Handler must be a function!')
  }

  /* simply concats the method and url, and base64 encodes it */
  const str = `${route.method}:${route.url}`
  return new Buffer(str).toString('base64')
}

/**
 * Gets each route from a dir, ensures uniqueness, and fingerprints it.
 * A route can be a flat object, an array of objects, or many nested arrays.
 * @param {string} file - The main file that exports an array of routes
 * @return {object} The parsed routes
 */
export function getRoutes (pattern) {
  /* the routes map */
  const parsed = {}

  /* get each route (or function) file, ignoring directories */
  const files = glob.sync(pattern, { nodir: true })
  files.forEach((file) => {
    /* get the contents of the route, and normalize into an array */
    let routes = require(path.resolve(file))
    if (!Array.isArray(routes)) routes = [routes]

    /* recursively go through each route and fingerprint */
    const walk = (arr) => {
      arr.forEach((route) => {
        /* found an array, repeat this process until a route object is found */
        if (Array.isArray(route)) return walk(route)

        /* fingerprint the route and make sure it's unique to the app */
        const print = fingerprint(route)
        if (parsed[print]) {
          throw new Error(`"${route.method} ${route.url}" is defined more than once!`)
        }

        /* add to route map */
        parsed[print] = route
      })
    }

    /* kick things off */
    walk(routes)
  })

  return parsed
}
