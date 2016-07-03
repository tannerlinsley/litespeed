import path from 'path'
import glob from 'glob'
import qs from 'querystring'
import config from './config'
import { escapeRegex } from './utils'

/**
 * Converts a segment URL to a regex.
 * @param {string} url - The url to convert
 * @returns {string} The splat url
 */
export function expandUrl (url, esc = true) {
  if (typeof url !== 'string') {
    throw new TypeError('URL must be a string')
  }

  /* split url at each slash */
  const split = url.split('/')

  /* go through each segment, and convert to regex */
  return '^' + split.map((seg, idx) => {
    /* escape regex characters if needed */
    let val = esc ? escapeRegex(seg) : seg

    /* match segments */
    if (seg.match(/^:/)) val = '[^\\/\\?]+'
    /* add end of line flag */
    if (idx === (split.length - 1)) val += '$'

    return val
  }).join('\\/')
}

/**
 * Extracts segment data from a url using a splat.
 * @param {string} url - The url to extract from
 * @param {string} fromUrl - The url pattern to use
 * @returns {object} The segment data
 */
export function getParamData (url, fromUrl) {
  if (typeof url !== 'string' || typeof fromUrl !== 'string') {
    throw new TypeError('URL must be a string')
  }

  const urlSplit = removeUrlQuery(url).split('/')
  const data = {}

  fromUrl.split('/').forEach((seg, indx) => {
    const match = seg.match(/^:(.*)/)
    if (match) data[match[1]] = urlSplit[indx]
  })

  return data
}

/**
 * Extracts and parses query data from the request.
 * @param {object} request - The http server request
 * @returns {object} The query data
 */
export function getQueryData (request = {}) {
  if (typeof request.url !== 'string') {
    throw new TypeError('Param must be an object with a URL key')
  }

  const match = request.url.match(/\?.*$/)
  return match ? qs.parse(match[0].substring(1)) : {}
}

/**
 * Removes the query string from a url for proper lookups.
 * @param {string} url - The URL to process
 * @returns {string} The processed URL
 */
export function removeUrlQuery (url = '') {
  const match = url.match(/\?/) || {}
  if (match.index) url = url.substring(0, match.index)

  return url
}

/**
 * Match a route in the route map.
 * @param {object} config - The lightrail route object
 * @returns {object} The route that was found
 */
export function lookupRoute (route, getAll = false) {
  const routes = config.routeMap

  const key = Object.keys(routes).find((r) => {
    return route.url.match(new RegExp(r))
  })
  if (!key) return

  const method = route.method.toLowerCase()
  return getAll ? routes[key] : routes[key][method]
}

/**
 * Creates a route and adds it to the route map.
 * @param {object} config - An lightrail route config
 */
export function createRoute (route) {
  /* route is a dir pattern, go through files */
  if (route.dir) {
    return getAllRoutes(route.dir, route.cwd)
  }
  /* if route is an array of routes, run for each one */
  if (Array.isArray(route)) {
    return route.forEach(createRoute)
  }
  if (!route) {
    throw new TypeError('Routes must have a configuration object')
  }
  if (typeof route.url !== 'string') {
    // TODO: check for a valid url
    throw new TypeError('Route URL must be a string')
  }
  if (typeof route.handler !== 'function') {
    throw new TypeError('Route handler must be a function!')
  }

  /* get regex url and and method type */
  const url = expandUrl(route.url)
  const method = route.method.toLowerCase()

  if (!config.routeMap[url]) {
    config.routeMap[url] = {}
  }

  if (config.routeMap[url][method]) {
    throw new Error(`"${route.method} ${route.url}" is already defined`)
  }

  config.routeMap[url][method] = route

  // /* ensure method in the route map */
  // if (!config.routeMap[method]) {
  //   config.routeMap[method] = {}
  // }
  //
  // /* add method to route options */
  // if (!config.routeMap._options[regexUrl]) {
  //   config.routeMap._options[regexUrl] = [method]
  // } else {
  //   config.routeMap._options[regexUrl].push(method)
  // }
  //
  // /* make sure route isn't a duplicate */
  // if (config.routeMap[method][regexUrl]) {
  //   throw new Error(`"${route.method} ${route.url}" is defined more than once`)
  // }
  //
  // /* add route to route map */
  // config.routeMap[method][regexUrl] = route
}

/**
 * Will walk a directory and get all routes matching a glob pattern.
 * @param {string} dir - The directory to walk
 */
export function getAllRoutes (dir, cwd) {
  /* resolve to absolute directory */
  dir = path.resolve(cwd || process.cwd(), dir)

  glob.sync(dir).forEach((file) => {
    const routes = require(file)
    createRoute(routes.default || routes)
  })
}
