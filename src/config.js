const config = {
  /* set server name (displays as Server header) */
  name: 'Airflow',
  /* the host to run on */
  host: 'localhost',
  /* the port to run on */
  port: 8000,
  /* request timeout limit (5s default) */
  timeout: 5000,
  /* limit for payload size in bytes (1mb default) */
  payloadLimit: 1048576,
  /* strip unknown values from payloads/queries */
  stripUnknown: true,
  /* whether to add basic security headers */
  protect: true,
  /* setup log tags */
  logs: { server: true, request: true, error: true },
  /* the global route map */
  routeMap: { get: {}, post: {}, put: {}, patch: {}, delete: {} },
  /* whether we are in dev mode */
  isDev: () => Boolean(String(process.env.NODE_ENV).match(/dev/i))
}

/**
 * Updates the config map with custom values.
 * @param {object} opts - Config options
 */
export function updateConfig (opts = {}) {
  config.name = opts.name || config.name
  config.host = opts.host || config.host
  config.port = parseInt(opts.port, 10) || config.port
  config.timeout = parseInt(opts.timeout, 10) || config.timeout
  config.payloadLimit = parseInt(opts.payloadLimit, 10) || config.payloadLimit
  /* values that can be boolean (can't use the || operator) */
  if (opts.stripUnknown !== undefined) {
    config.stripUnknown = opts.stripUnknown
  }
  if (opts.protect !== undefined) {
    config.protect = opts.protect
  }
  if (opts.logs !== undefined) {
    config.logs = opts.logs !== false
      ? Object.assign({}, config.logs, opts.logs)
      : { server: false, request: false, error: false }
  }
}

export default config
