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
    if (seg.match(/^:/)) val = '[^\\/]+'
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
export function getSegmentData (url, fromUrl) {
  if (typeof url !== 'string' || typeof fromUrl !== 'string') {
    throw new TypeError('URL must be a string')
  }

  const urlSplit = url.split('/')
  const data = {}

  fromUrl.split('/').forEach((seg, indx) => {
    const match = seg.match(/^:(.*)/)
    if (match) data[match[1]] = urlSplit[indx]
  })

  return data
}

/**
 * Match a route in the route map.
 * @param {object} config - The airflow route object
 * @param {object} routeMap - The global routes map
 * @returns {object} The route that was found
 */
export function lookupRoute (config, routeMap) {
  const methodMap = routeMap[config.method.toLowerCase()]

  const key = Object.keys(methodMap).find((r) => {
    return config.url.match(new RegExp(r))
  })

  return methodMap[key]
}

/**
 * Creates a route and adds it to the route map.
 * @param {object} config - An airflow route config
 */
export function createRoute (route) {
  // TODO: parse config as array(s) as well as object
  // TODO: check for a valid url

  if (!route) {
    throw new TypeError('Routes must have a configuration object')
  }
  if (!route.method.match(/^(get|post|put|patch|delete)$/i)) {
    throw new TypeError('Route method must be one of [ GET, POST, PUT, PATCH, DELETE ]')
  }
  if (typeof route.url !== 'string') {
    throw new TypeError('Route URL must be a string')
  }
  if (typeof route.handler !== 'function') {
    throw new TypeError('Route handler must be a function!')
  }

  /* get regex url and and method type */
  const regexUrl = expandUrl(route.url)
  const method = route.method.toLowerCase()

  /* make sure route isn't a duplicate */
  if (config.routeMap[method][regexUrl]) {
    throw new Error(`"${route.method} ${route.url}" is defined more than once`)
  }

  /* add route to route map */
  config.routeMap[method][regexUrl] = route
}
