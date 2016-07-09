import path from 'path'
import glob from 'glob'
import qs from 'querystring'
import config from './config'
import { escapeRegex, stringifyRegex, typeOf } from './utils'

/**
 * Converts a segment URL to a regex.
 * @param {string/regex} url - The url to convert
 * @returns {string} The splat url
 */
export function expandUrl (url) {
  const urlType = typeOf(url)
  if (urlType === 'regexp') return url

  if (urlType !== 'string') {
    throw new TypeError('URL must be a string')
  }

  /* split url at each slash */
  const split = url.split('/')

  /* go through each segment, and convert to regex */
  return new RegExp('^' + split.map((seg, idx) => {
    /* escape regex characters if needed */
    let val = escapeRegex(seg)

    /* match segments */
    if (seg.match(/^:/)) val = '[^\\/\\?]+'
    /* add end of line flag */
    if (idx === (split.length - 1)) val += '$'

    return val
  }).join('\\/'))
}

/**
 * Extracts segment data from a url using a splat.
 * @param {string} url - The url to extract from
 * @param {string} fromUrl - The url pattern to use
 * @returns {object} The segment data
 */
export function getParamData (url, fromUrl) {
  if (typeof url !== 'string') {
    throw new TypeError('URL must be a string')
  }

  const urlSplit = removeUrlQuery(url).split('/')
  const data = {}

  stringifyRegex(fromUrl).split('/').forEach((seg, indx) => {
    const match = seg.match(/^:(.*)/)
    if (match) data[match[1]] = urlSplit[indx]
  })

  /* if url is a regex, extract matched data */
  if (typeOf(fromUrl) === 'regexp') {
    url.match(fromUrl).slice(1).forEach((val, indx) => {
      /* add to data as '$1', '$2', etc. */
      data[`$${indx + 1}`] = val
    })
  }

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
  const routes = config._routeMap

  const key = Object.keys(routes).find((r) => {
    const regex = new RegExp(stringifyRegex(r))
    return route.url.match(regex)
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
  /* if route is an array of routes, run for each one */
  if (Array.isArray(route)) {
    return route.forEach(createRoute)
  }
  if (!route) {
    throw new TypeError('Routes must have a configuration object')
  }
  if (!typeOf(route.url).match(/(string|regexp)/)) {
    // TODO: check for a valid url
    throw new TypeError('Route URL must be a string or regex')
  }
  if (typeOf(route.handler) !== 'function') {
    throw new TypeError('Route handler must be a function!')
  }

  /* get regex url and and method type */
  const url = expandUrl(route.url)
  const method = route.method.toLowerCase()

  /* ensure route in the map */
  if (!config._routeMap[url]) {
    config._routeMap[url] = {}
  }

  /* make sure route isn't a duplicate */
  if (config._routeMap[url][method]) {
    throw new Error(`"${route.method} ${route.url}" is already defined`)
  }

  /* add route method to route map */
  config._routeMap[url][method] = route
}

/**
 * Will walk a directory and get all routes matching a glob pattern.
 * @param {string} dir - The directory to walk
 */
export function getAllRoutes (data = {}) {
  /* resolve to absolute directory */
  data.dir = path.resolve(data.cwd || process.cwd(), data.dir || '**/*.js')

  glob.sync(data.dir).forEach((file) => {
    const routes = require(file)
    createRoute(routes.default || routes)
  })
}
