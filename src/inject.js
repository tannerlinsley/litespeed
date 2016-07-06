import http from 'http'
import stream from 'stream'
import config from './config'
import { onRequest } from './request'

/**
 * Allows a http request to be injected into the server without
 * the overhead of actually opening the socket.
 * @param {object} route - An http request object (method, url, body)
 * @returns {object} The result of the request
 */
export default async function (route) {
  config.logs = false

  const request = new HijackedStream(route)
  const response = new http.ServerResponse(request)

  await onRequest(request, response)

  /* parse raw http response */
  const body = response.output[0].split('\r\n\r\n')[1]
  const result = String(response._headers['content-type']).match(/^application\/json/i)
    ? JSON.parse(body) : body

  return {
    ...response, result,
    headers: response._headers
  }
}

/**
 * A highjacked readable string that injects an http request.
 * @param {object} route - The http request data
 */
class HijackedStream extends stream.Readable {
  constructor (route) {
    super()

    this.method = route.method
    this.url = route.url
    this.headers = route.headers || {}
    this.socket = {}
    this.connection = {}

    if (route.body) {
      if (!this.headers['content-type']) {
        this.headers['content-type'] = 'application/json'
      }
      this.push(typeof route.body === 'object' ? JSON.stringify(route.body) : route.body)
    }

    this.push(null)
  }
}
