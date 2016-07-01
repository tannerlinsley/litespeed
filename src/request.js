import qs from 'querystring'
import typer from 'media-typer'
import rawBody from 'raw-body'
import config from './config'
import { sendResponse } from './response'
import { lookupRoute, removeUrlQuery, getParamData, getQueryData } from './router'
import { getIpAddress } from './utils'
import Errors, { cleanStackTrace } from './errors'

/**
 * The server's main request handler.
 * @param {object} request - The http server request
 * @param {object} response - The http server response
 */
export async function onRequest (request, response) {
  let route
  try {
    /* log request info */
    const remoteAddress = getIpAddress(request)
    if (config.logs.request) {
      console.log(`=> ${new Date().toISOString()} ${request.method} ${request.url} from ${remoteAddress}`)
    }

    /* set timeout, and send 408 when it happens */
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

    /* default values */
    route.validation = route.validation || {}
    route.statusCode = route.statusCode || 200

    /* put together request data */
    const requestData = {
      body: stripUnknownData(await getBodyData(request), route.validation.body),
      query: stripUnknownData(getQueryData(request), route.validation.query),
      params: getParamData(request.url, route.url),
      headers: request.headers,
      info: {
        /* defined above for logging purposes */
        remoteAddress
      }
    }

    /* functions exposed to handler response arg */
    const responseData = {
      setHeader: (name, value) => response.setHeader(name, value),
      redirect: (url) => (response._redirectTo = url)
    }

    /* validate data */
    await runValidations(route, requestData)

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
 * Gets the body data of the request based on the content type.
 * Puts payload limit in place, and parses data appropriately.
 * @param {object} request - The http server request
 * @returns {object} The body data
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

/**
 * If validations are present on a route, this will strip all unknown
 * data from the payload (meaning it's not in the validation map).
 * @param {object} data - The data to strip from
 * @param {object} validations - The validations object for the payload type
 * @returns {object} The new data object excluding stripped values
 */
export function stripUnknownData (data, validations) {
  if (!config.stripUnknown) return data

  const newData = {}

  const keys = Object.keys(validations || {})
  if (keys.length === 0) return data

  for (const i in data) {
    if (keys.indexOf(i) !== -1) {
      newData[i] = data[i]
    }
  }

  return newData
}

/**
 * Runs validation rules against the body, query, and param payloads.
 * Will return a 400 validation error to the user if any validation fails.
 * All validation errors will return rather than the first one.
 * @param {object} route - The airflow route object
 * @param {object} data - The data to validate against
 * @returns {promise} Rejected if any errors occur
 */
export async function runValidations (route, data) {
  /* will contain all validation errors that occur throughout function */
  let allErrors = []

  /* set defaults */
  const validation = Object.assign({}, {
    body: {}, query: {}, params: {}
  }, route.validation)

  /* goes through each rule and validates against value */
  const validate = (key) => {
    for (const i in validation[key]) {
      const validateResult = validation[key][i].run(i, data[key][i], key)
      if (validateResult.length > 0) allErrors = allErrors.concat(validateResult)
    }
  }

  /* run validations */
  validate('body')
  validate('query')
  validate('params')
  validate('headers')

  /* throw if there are any errors */
  if (allErrors.length > 0) {
    const baseError = new Errors().badRequest('A validation error occured')
    const error = { ...baseError, validation: allErrors }

    throw error
  }
}
