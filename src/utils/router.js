import path from 'path'
import fs from 'fs-promise'

/**
 * Gets each route from the main file and fingerprints it.
 * @param {string} file - The main file that exports an array of routes
 * @return {object} The fingerprinted routes
 */
export async function getRoutes (file = 'index.js') {
  const mainFile = path.resolve(process.cwd(), file)
  if (!await fs.exists(mainFile)) {
    throw new Error(`"${file}" does not exist!`)
  }

  const routes = {}
  require(mainFile).forEach((route) => {
    const print = fingerprint(route)

    if (routes[print]) {
      throw new Error(`"${route.method} ${route.path}" is defined more than once!`)
    }

    routes[print] = route
  })

  return routes
}

/**
 * Fingerprints a route for finding it later.
 * @param {object} route - The airwave route object
 * @returns The encoded string
 */
export function fingerprint (route) {
  if (typeof route !== 'object') {
    throw new TypeError('route must be an object!')
  }
  if (!route.method || (!route.path && !route.url)) {
    throw new Error('route is not valid!')
  }

  const str = `${route.method}:${route.path || route.url}`
  return new Buffer(str).toString('base64')
}
