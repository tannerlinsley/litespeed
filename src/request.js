import qs from 'querystring'
import typer from 'media-typer'
import rawBody from 'raw-body'
import config from './config'
import { sendResponse } from './response'
import { lookupRoute, removeUrlQuery, getParamData, getQueryData } from './router'
import { getIpAddress } from './utils'
import Errors, { cleanStackTrace } from './errors'

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
    if (config.logs.request) {
      console.log(`=> ${new Date().toISOString()} ${request.method} ${request.url} from ${remoteAddress}`)
    }

    /* setup timeout */
    let hasTimedOut = false
    response.setTimeout(config.timeout, (socket) => {
      const msg = `Max request time of ${config.timeout / 1000}s reached`
      sendResponse(response, 408, new Errors(408, msg))

      hasTimedOut = true
      socket.destroy()
    })

    /* look up route from route map */
    route = lookupRoute({
      method: request.method,
      url: removeUrlQuery(request.url)
    })

    /* route not found */
    if (!route) throw new Errors().notFound()

    /* put together request data */
    const requestData = {
      body: await getBodyData(request),
      query: getQueryData(request),
      params: getParamData(request.url, route.url),
      headers: request.headers,
      info: {
        /* defined above for logging purposes */
        remoteAddress
      }
    }

    /* functions exposed to handler response arg */
    const responseData = {
      setHeader: (name, value) => response.setHeader(name, value)
    }

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

    /* security headers */
    if (config.protect) {
      response.setHeader('X-Content-Type-Options', 'nosniff')
      response.setHeader('X-Download-Options', 'noopen')
      response.setHeader('X-Frame-Options', 'deny')
      response.setHeader('X-XSS-Protection', '1; mode=block')
    }

    /* respond with result */
    if (!hasTimedOut) sendResponse(response, statusCode, result)
  } catch (error) {
    onError(response, error, route)
  }
}

/**
 * Will handle a request error, whether it is thrown or returned from handler.
 * It will format if necessary and return correct headers.
 * @param {any} error - The error being thrown
 */
export async function onError (response, error, route) {
  try {
    /* allow a custom error function defined on route */
    if (route && typeof route.onError === 'function') {
      const onErrorResponse = route.onError(error)
      const errorResponse = onErrorResponse.then
        ? await onErrorResponse : onErrorResponse

      const statusCode = errorResponse.statusCode || 500
      return sendResponse(response, statusCode, errorResponse)
    }

    /* default to code 500 if not specified */
    const statusCode = error.statusCode || 500

    /* format error if it's not already */
    const errorResponse = !error.error
      ? new Errors(statusCode, error.message || error)
      : error

    /* display and log server errors correctly */
    if (statusCode >= 500) {
      if (config.logs.error) {
        let toLog = error

        /* turn into an error if needed */
        if (!(toLog instanceof Error)) {
          toLog = new Error(JSON.stringify(toLog))
        }

        /* log out error with a filtered stack trace */
        console.error(cleanStackTrace(toLog))
      }

      /* remove server errors unless in dev mode */
      if (statusCode >= 500 && !config.isDev() && errorResponse.message) {
        delete errorResponse.message
      }
    }

    /* respond with error */
    sendResponse(response, statusCode, errorResponse)
  } catch (err) {
    console.error(err)
    sendResponse(response, 500, new Errors(500))
  }
}

/**
 *
 */
export async function getBodyData (request) {
  /* parse content type so we can process data */
  const contentType = request.headers['content-type'] || 'text/plain; charset=utf-8'
  const mediaType = typer.parse(contentType)

  /* get request body data */
  let body = {}
  if (request.method.match(/^(post|put|patch)$/i)) {
    // TODO: stream.destroy or stream.close needed for file descriptors?
    body = await rawBody(request, {
      limit: config.payloadLimit,
      length: request.headers['content-length'],
      encoding: mediaType.parameters.charset || 'utf-8'
    })
  }

  /* process body data */
  switch (mediaType.subtype) {
    case 'json':
      try {
        body = JSON.parse(body)
      } catch (err) {
        throw new Errors().badRequest('Invalid JSON payload')
      }
      break
    case 'x-www-form-urlencoded':
      try {
        body = qs.parse(body)
      } catch (err) {
        throw new Errors().badRequest('Invalid form data')
      }
      break
    case 'plain':
      /* no processing needed */
      break
    default:
      throw new Errors().unsupportedMediaType()
  }

  return body
}

// /* run validations */
// await new Promise((resolve, reject) => {
//   const allErrors = []
//
//   /* defaults */
//   route.validation = route.validation || {}
//   route.validation.body = route.validation.body || {}
//   route.validation.query = route.validation.query || {}
//   route.validation.params = route.validation.params || {}
//
//   /* strip unknown body/query values */
//   if (this.stripUnknown) {
//     const bodyValidationKeys = Object.keys(route.validation.body)
//     if (bodyValidationKeys.length > 0) {
//       for (const i in body) {
//         if (bodyValidationKeys.indexOf(i) < 0) delete body[i]
//       }
//     }
//
//     const queryValidationKeys = Object.keys(route.validation.query)
//     if (queryValidationKeys.length > 0) {
//       for (const i in query) {
//         if (queryValidationKeys.indexOf(i) < 0) delete query[i]
//       }
//     }
//   }
//
//   /* validate body data */
//   for (const i in route.validation.body) {
//     const validateResult = route.validation.body[i].run(i, body[i])
//     if (validateResult.length > 0) allErrors.push(validateResult)
//   }
//
//   /* validate query data */
//   for (const i in route.validation.query) {
//     const validateResult = route.validation.query[i].run(i, query[i], 'query')
//     if (validateResult.length > 0) allErrors.push(validateResult)
//   }
//
//   /* validate params data */
//   for (const i in route.validation.params) {
//     const validateResult = route.validation.params[i].run(i, params[i], 'params')
//     if (validateResult.length > 0) allErrors.push(validateResult)
//   }
//
//   /* reject with 400 error and validation errors if there are any */
//   if (allErrors.length > 0) {
//     return reject({
//       ...errors.badRequest('A validation error occured'),
//       validation: allErrors
//     })
//   }
//
//   resolve()
// })
//
