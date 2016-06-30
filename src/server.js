import http from 'http'
import config from './config'
import { onRequest } from './request'

/**
 * Creates http server, setup request handler, and begin listening.
 * @returns {promise} Resolves with the server url
 */
export default function () {
  const server = http.createServer(onRequest)
  const url = `http://${config.host}:${config.port}`

  server.timeout = config.timeout

  /* returns a promise resolving with the server url */
  return new Promise((resolve, reject) => {
    server.listen(config.port, config.host, () => {
      if (config.logs.server) {
        console.log(`=> Running at ${url}`)
      }
      resolve(url)
    })
  })
}
