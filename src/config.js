import { typeOf } from './utils'

const config = {
  /* the global route map */
  _routeMap: {},
  /* whether we are in dev mode */
  _isDev: () => Boolean(String(process.env.NODE_ENV).match(/dev/i)),

  /* set name (displays as X-Powered-By header) */
  name: 'Lightrail',
  name__type: ['string', 'boolean'],
  /* the host to run on */
  host: process.env.HOST || '0.0.0.0',
  host__type: 'string',
  /* the port to run on */
  port: process.env.PORT || 8000,
  port__type: 'number',
  /* whether to accept a trailing slash */
  trailingSlash: true,
  trailingSlash__type: 'boolean',
  /* whether to prettify output JSON */
  pretty: false,
  pretty__type: 'boolean',
  /* request timeout limit (5s default) */
  timeout: 5000,
  timeout__type: 'number',
  /* limit for payload size in bytes (1mb default) */
  payloadLimit: 1048576,
  payloadLimit__type: 'number',
  /* strip unknown values from payloads/queries */
  stripUnknown: true,
  stripUnknown__type: 'boolean',
  /* whether to add basic security headers */
  protective: true,
  protective__type: 'boolean',
  /* whether to check the x-forwarded-for header for user's IP address */
  realIp: true,
  realIp__type: 'boolean',
  /* url for the docs */
  documentationUrl: '/docs',
  documentationUrl__type: 'string',
  /* setup log tags */
  logs: ['server', 'request', 'error'],
  logs__type: ['array', 'boolean'],
  /* whether to use colors when logging */
  colors: true,
  colors__type: 'boolean',
  /* prehandler functions */
  preHandlers: [],
  preHandlers__type: 'array'
}

/**
 * Updates the config map with custom values.
 * @param {object} opts - Config options
 */
export function updateConfig (opts = {}) {
  Object.keys(opts).forEach((opt) => {
    if (opts[opt] === undefined) return

    /* make sure option is valid */
    if (opt.match(/^_/)) {
      throw new Error(`"${opt}" is a read-only value`)
    }
    if (!config[opt]) {
      throw new Error(`"${opt}" isn't a valid config key`)
    }

    /* get allowed types for the config value */
    const type = Array.isArray(config[`${opt}__type`])
      ? config[`${opt}__type`] : [config[`${opt}__type`]]
    /* make sure type is valid */
    if (type.indexOf(typeOf(opts[opt])) === -1) {
      throw new TypeError(`"${opt}" must be of type "${type.join(', ')}"`)
    }

    /* set value in config */
    config[opt] = opts[opt]
  })
}

export default config
