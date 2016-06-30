import stream from 'stream'
// import qs from 'querystring'
// import rawBody from 'raw-body'
// import typer from 'media-typer'
import config from './config'
import { lookupRoute } from './router'
import { getIpAddress } from './utils'
import { errors, getError } from './errors'

/**
 * The server's request handler.
 * @param {object} request - The http server request
 * @param {object} response - The http server response
 */
export async function onRequest (request, response) {
  let route
  try {
    /* log request */
    const remoteAddress = getIpAddress(request)
    if (config().logs.request) {
      console.log(`=> ${new Date().toISOString()} ${request.method} ${request.url} from ${remoteAddress}`)
    }

    /* setup timeout */
    let hasTimedOut = false
    response.setTimeout(config().timeout, (socket) => {
      const msg = `Max request time of ${config().timeout / 1000}s reached`
      sendResponse(response, 408, getError(408, msg))

      hasTimedOut = true
      socket.destroy()
    })

    /* lookup from route map */
    route = lookupRoute(request, config().routeMap)
    if (!route) throw errors.notFound()

    const requestData = {}
    const responseData = {}

    /* run handler */
    const handlerResult = route.handler(requestData, responseData)
    /* resolve the promise if one is returned */
    // TODO: somehow cancel the promise when request times out
    const result = (handlerResult && handlerResult.then
      ? await handlerResult : handlerResult) || { __noResponse: true }

    /* get status code from response or route */
    const statusCode = typeof result === 'object' && result.statusCode
      ? result.statusCode : route.statusCode

    /* result is an error, send it to the catch */
    if (statusCode >= 400 || result instanceof Error) {
      throw result
    }

    /* respond with result */
    if (!hasTimedOut) sendResponse(response, statusCode, result)
  } catch (error) {
    console.log(error)
  }
}

/**
 * Responds to a request with the correct status code and headers.
 * Will auto-format the response into an Airflow object if needed,
 * as well as stringify response objects.
 * @param {object} res - The http server response
 * @param {number} statusCode - The status code to respond with
 * @param {any} data - Data to send as the response
 */
export function sendResponse (response, statusCode, data) {
  /* send proper status code and headers */
  response.statusCode = parseInt(statusCode, 10) || 200
  response.setHeader('X-Powered-By', config().name)
  response.setHeader('Cache-Control', 'no-cache')

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
          data = config().isDev ? JSON.stringify(data, null, 2) : JSON.stringify(data)
          response.setHeader('Content-Type', 'application/json')
        }
      }
      /* must use byteLength since we need the actual length vs # of characters */
      response.setHeader('Content-Length', Buffer.byteLength(data))
      response.end(data)
    }
  } else {
    response.end()
  }
}

// async onRequest (request, response) {
//   let route
//   try {
//     /* get url query data */
//     const queryRegex = request.url.match(/\?.*$/) || {}
//     const query = Array.isArray(queryRegex)
//       ? qs.parse(queryRegex[0].substring(1)) : {}
//
//     /* get url params */
//     const params = {} // TODO!
//
//     /* get url ready for lookup */
//     if (queryRegex.index) {
//       request.url = request.url.substring(0, queryRegex.index)
//     }
//
//
//
//     /* parse content type so we can process data */
//     const contentType = request.headers['content-type'] || 'text/plain; charset=utf-8'
//     const mediaType = typer.parse(contentType)
//
//     /* get request body data */
//     let body = {}
//     if (request.method.match(/^(post|put|patch)$/i)) {
//       // TODO: stream.destroy or stream.close needed for file descriptors?
//       body = await rawBody(request, {
//         limit: this.payloadLimit,
//         length: request.headers['content-length'],
//         encoding: mediaType.parameters.charset || 'utf-8'
//       })
//     }
//
//     /* process body data */
//     switch (mediaType.subtype) {
//       case 'json':
//         try {
//           body = JSON.parse(body)
//         } catch (err) {
//           throw errors.badRequest('Invalid JSON payload')
//         }
//         break
//       case 'x-www-form-urlencoded':
//         try {
//           body = qs.parse(body)
//         } catch (err) {
//           throw errors.badRequest('Invalid form data')
//         }
//         break
//       case 'plain':
  //       /* no processing needed */
  //       break
  //     default:
  //       throw errors.unsupportedMediaType()
  //   }
  //
  //   /* run validations */
  //   await new Promise((resolve, reject) => {
  //     const allErrors = []
  //
  //     /* defaults */
  //     route.validation = route.validation || {}
  //     route.validation.body = route.validation.body || {}
  //     route.validation.query = route.validation.query || {}
  //     route.validation.params = route.validation.params || {}
  //
  //     /* strip unknown body/query values */
  //     if (this.stripUnknown) {
  //       const bodyValidationKeys = Object.keys(route.validation.body)
  //       if (bodyValidationKeys.length > 0) {
  //         for (const i in body) {
  //           if (bodyValidationKeys.indexOf(i) < 0) delete body[i]
  //         }
  //       }
  //
  //       const queryValidationKeys = Object.keys(route.validation.query)
  //       if (queryValidationKeys.length > 0) {
  //         for (const i in query) {
  //           if (queryValidationKeys.indexOf(i) < 0) delete query[i]
  //         }
  //       }
  //     }
  //
  //     /* validate body data */
  //     for (const i in route.validation.body) {
  //       const validateResult = route.validation.body[i].run(i, body[i])
  //       if (validateResult.length > 0) allErrors.push(validateResult)
  //     }
  //
  //     /* validate query data */
  //     for (const i in route.validation.query) {
  //       const validateResult = route.validation.query[i].run(i, query[i], 'query')
  //       if (validateResult.length > 0) allErrors.push(validateResult)
  //     }
  //
  //     /* validate params data */
  //     for (const i in route.validation.params) {
  //       const validateResult = route.validation.params[i].run(i, params[i], 'params')
  //       if (validateResult.length > 0) allErrors.push(validateResult)
  //     }
  //
  //     /* reject with 400 error and validation errors if there are any */
  //     if (allErrors.length > 0) {
  //       return reject({
  //         ...errors.badRequest('A validation error occured'),
  //         validation: allErrors
  //       })
  //     }
  //
  //     resolve()
  //   })
  //
  //   /* request data sent through to route handler */
  //   const requestData = {
  //     query, body, params,
  //     headers: request.headers,
  //     info: {
  //       remoteAddress
  //     }
  //   }
  //
  //   /* response functions exposed to handler */
  //   const responseData = {
  //     setHeader: (name, value) => response.setHeader(name, value)
  //   }
  //
  //
  //
  //   /* security headers */
  //   if (route.protect) {
  //     response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  //     response.setHeader('X-Content-Type-Options', 'nosniff')
  //     response.setHeader('X-Download-Options', 'noopen')
  //     response.setHeader('X-Frame-Options', 'DENY')
  //     response.setHeader('X-XSS-Protection', '1; mode=block')
  //   }
  // } catch (error) {
//     /* catch errors within the error handler :) */
//     try {
//       if (route && typeof route.onError === 'function') {
//         const onErrorResponse = route.onError(error)
//         const errorResponse = onErrorResponse.then
//           ? await onErrorResponse : onErrorResponse
//
//         const statusCode = errorResponse.statusCode || 500
//         return this.respond(response, statusCode, errorResponse)
//       }
//
//       const statusCode = error.statusCode || 500
//
//       /* format error if it's not already */
//       const errorResponse = !error.error
//         ? getError(statusCode, error.message || error)
//         : error
//
//       /* display and log server errors correctly */
//       if (statusCode >= 500) {
//         if (this.logs.error) {
//           let toLog = error
//
//           /* turn into an error if needed */
//           if (!(toLog instanceof Error)) {
//             toLog = new Error(JSON.stringify(toLog))
//           }
//
//           /* log out error with a filtered stack trace */
//           console.error(cleanStackTrace(toLog))
//         }
//
//         /* remove server errors unless in dev mode */
//         if (statusCode >= 500 && !this.isDev && errorResponse.message) {
//           delete errorResponse.message
//         }
//       }
//
//       /* respond with error */
//       this.respond(response, statusCode, errorResponse)
//     } catch (err) {
//       console.error(err)
//       this.respond(response, 500, getError(500))
//     }
//   }
// }
