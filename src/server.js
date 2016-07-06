import http from 'http'
import config from './config'
import { onRequest } from './request'
import { logTurnedOn } from './utils'

/**
 * Creates http server, setup request handler, and begin listening.
 * @returns {promise} Resolves with the server url
 */
export default function (cb = () => {}) {
  const server = http.createServer(onRequest)
  const url = `http://${config.host}:${config.port}`

  server.timeout = config.timeout

  /* returns a promise resolving with the server url */
  return new Promise((resolve, reject) => {
    server.listen(config.port, config.host, () => {
      if (logTurnedOn('server')) {
        console.log(`=> Running at ${url}`)
      }
      cb(url)
      resolve(url)
    })
  })
}
