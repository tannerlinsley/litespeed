import config from './config'

/**
 * Tells whether a particular log tag is enabled.
 * @param {string} tag - The log tag to check
 * @returns {boolean} Whether tag is enabled
 */
export function logTurnedOn (tag) {
  if (config.logs === false) return false
  return config.logs.indexOf(tag) > -1
}
