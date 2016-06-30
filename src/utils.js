/**
 * Gets an IP address from a Hapi request, taking into account
 * multiple forwarded addresses (such as from a proxy server).
 * @param {object} request - The request send through by a Hapi handler
 * @returns {string} The user's IP address (best guess)
 */
export function getIpAddress (request) {
  const remote = request.connection.remoteAddress || request.socket.remoteAddress

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
