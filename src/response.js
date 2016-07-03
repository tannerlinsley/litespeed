import stream from 'stream'
import config from './config'

/**
 * Responds to a request with the correct status code and headers.
 * Will auto-format the response into an Lightrail object if needed,
 * as well as stringify response objects.
 * @param {object} res - The http server response
 * @param {number} statusCode - The status code to respond with
 * @param {any} data - Data to send as the response
 */
export function sendResponse (response, statusCode, data) {
  /* if a redirect was set from the handler */
  if (response._redirectTo) {
    response.statusCode = 301
    response.setHeader('Location', response._redirectTo)
    response.end(`Redirecting to ${response._redirectTo}`)
    return
  }

  /* send proper status code and headers */
  response.statusCode = parseInt(statusCode, 10) || 200
  response.setHeader('X-Powered-By', config.name)
  response.setHeader('Cache-Control', 'max-age=0, private, must-revalidate')

  /* send correct headers and response based on data type */
  if (data) {
    if (Buffer.isBuffer(data)) {
      response.setHeader('Content-Type', 'application/octet-stream')
      response.setHeader('Content-Length', data.length)
      response.end(data)
    } else if (data instanceof stream.Stream) {
      response.setHeader('Content-Type', 'application/octet-stream')
      data.pipe(response)
    } else {
      response.setHeader('Content-Type', 'text/plain')
      if (typeof data === 'object') {
        /* set if the handler doesn't return anything */
        /* defaults to the __noResponse object above */
        if (data.__noResponse) {
          data = ''
        } else {
          /* only prettify in dev mode to take advantages of V8 optimizations */
          data = config.isDev() ? JSON.stringify(data, null, 2) : JSON.stringify(data)
          response.setHeader('Content-Type', 'application/json')
        }
      } else if (data.match(/^<.+>/)) {
        /* content is html */
        response.setHeader('Content-Type', 'text/html')
      }
      /* must use byteLength since we need the actual length vs # of characters */
      response.setHeader('Content-Length', Buffer.byteLength(data))
      response.end(data)
    }
  } else {
    response.end()
  }
}
