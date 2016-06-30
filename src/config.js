const config = (opts = {}) => ({
  /* get environment */
  env: String(process.env.NODE_ENV),

  /* whether we are in dev mode */
  isDev: config.env.match(/dev/i),

  /* set server name (displays as Server header) */
  name: opts.name || 'Airflow',

  /* the host to run on */
  host: opts.host || 'localhost',

  /* the port to run on */
  port: parseInt(opts.port, 10) || 8000,

  /* request timeout limit (5s default) */
  timeout: parseInt(opts.timeout, 10) || 5000,

  /* strip unknown values from payloads/queries */
  stripUnknown: opts.stripUnknown || true,

  /* limit for payload size in bytes (1mb default) */
  payloadLimit: parseInt(opts.payloadLimit, 10) || 1048576,

  /* whether to add basic security headers */
  protect: opts.protect || true,

  /* setup log tags */
  logs: opts.logs !== false
    ? Object.assign({}, { server: true, request: true, error: true }, opts.logs || {})
    : { server: false, request: false, error: false }, // turns all logging off

  /* the global route map */
  routeMap: {
    get: {}, post: {}, put: {}, patch: {}, delete: {}
  }
})

export default config
