import config from './config'

/**
 * Gets an IP address from a Hapi request, taking into account
 * multiple forwarded addresses (such as from a proxy server).
 * @param {object} request - The request send through by a Hapi handler
 * @returns {string} The user's IP address (best guess)
 */
export function getIpAddress (request) {
  const remote = request.connection.remoteAddress || request.socket.remoteAddress
  if (!config.realIp) return remote

  const forwarded = request.headers['x-forwarded-for']
  if (!forwarded) return remote

  /* return first in the list if there are many */
  return String(forwarded).split(',')[0].trim()
}

/**
 * Escapes spcial characters from a string for valid use as a regex.
 * @param {string} str - The string to escape
 * @returns {string} The regex-valid string
 */
export function escapeRegex (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
}

/**
 * A better typeof to determine the type of a variable.
 * @param {any} val - The value to look at
 * @return {string} The value type
 */
export function typeOf (val) {
  const str = Object.prototype.toString.call(val)
  return str.substring(str.indexOf(' ') + 1, str.length - 1).toLowerCase()
}

/**
 * Tells whether a particular log tag is enabled.
 * @param {string} tag - The log tag to check
 * @returns {boolean} Whether tag is enabled
 */
export function logTurnedOn (tag) {
  if (config.logs === false) return false
  return config.logs.indexOf(tag) > -1
}

/**
 * Runs an array of Promises in order rather than simultaneously.
 * @param {array} chain - The chain of promises
 */
export function promiseWaterfall (chain = []) {
  if (!Array.isArray(chain)) {
    throw new TypeError('Promise chain must be an array')
  }

  return chain.reduce((prev, next) => {
    return prev.then(next)
  }, Promise.resolve())
}
