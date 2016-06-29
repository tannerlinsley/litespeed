/**
 * Creates a route and parses the metadata for it.
 * @param {object} config - An airflow route config
 * @param {object} routeMap - The current server's route map
 * @returns {object} The route info
 */
export function parseRoute (config, routeMap = {}) {
  if (!config) {
    throw new TypeError('Routes must have a configuration object')
  }
  if (!config.method.match(/^(get|post|put|patch|delete)$/i)) {
    throw new TypeError('Route method must be one of [ GET, POST, PUT, PATCH, DELETE ]')
  }
  if (typeof config.url !== 'string') {
    // TODO: check for a valid url
    throw new TypeError('Route URL must be a string')
  }
  if (typeof config.handler !== 'function') {
    throw new TypeError('Route handler must be a function!')
  }

  /* get route info */
  const splatter = getSplat(config.url)
  const method = config.method.toLowerCase()

  /* make sure route isn't a duplicate */
  if (routeMap.routes[method][config.url]) {
    throw new Error(`"${config.method} ${config.url}" is defined more than once`)
  }

  return {
    splatter, method,
    route: config
  }
}

/**
 * Looks up a route from the routes map by the splatter.
 * @param {object} config - The airflow route object
 * @param {object} routesMap - The global routes map
 * @returns {object} The route that was found
 */
export function lookupRoute (config, routesMap) {
  const methodMap = routesMap.routes[config.method.toLowerCase()]

  let route
  if (config.url.match(/:/)) {
    const splatter = getSplat(config.url)
    route = methodMap[splatter.splat]
  } else {
    route = methodMap[config.url]
  }

  return route
}

/**
 * Extracts splat data from a url.
 * @param {string} url - The url to convert
 * @returns {string} The splat url
 */
export function getSplat (url) {
  if (typeof url !== 'string') {
    throw new TypeError('URL must be a string')
  }

  const splat = url.split('/')
    /* replaces each segment with a splat */
    .map((seg) => seg.match(/^:/) ? '*' : seg)
    .join('/')

  return { url, splat }
}

/**
 * Extracts segment data from a url using a splat.
 * @param {string} url - The url to parse
 * @param {string} splatter - The url splatter (inludes url and splat)
 * @returns {object} The segment data
 */
export function getSegmentData (url, splatter) {
  if (typeof url !== 'string') {
    throw new TypeError('URL must be a string')
  }
  if (typeof splatter !== 'object') {
    throw new TypeError('Splatter must be an object')
  }

  const urlSplit = url.split('/')
  const splatterUrlSplit = splatter.url.split('/')

  const data = {}

  splatter.splat.split('/').forEach((seg, indx) => {
    if (seg === '*') {
      data[splatterUrlSplit[indx].substring(1)] = urlSplit[indx]
    }
  })

  return data
}
