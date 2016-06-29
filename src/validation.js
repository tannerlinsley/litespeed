import validator from 'validator'

class Validation {
  constructor () {
    /* all rules to run against value */
    this.rules = []
    /* whether the current value is required */
    this.isRequired = false
  }

  /**
   * Runs the validation chain.
   * @param {any} val - The value to validate
   * @param {string} field - The field name of the value
   * @returns {array} An array of error maps
   */
  run (field, val, where = 'body') {
    /* all errors */
    const errors = []
    /* no value passed through and it's not required */
    if (!val && !this.isRequired) return []

    /* don't continue with other validations if required value is empty */
    if (!val && this.isRequired) {
      return [{ field, message: 'cannot be empty', where }]
    }

    /* go through and run each validation against value */
    this.rules.forEach((rule) => {
      if (!rule.validate(val)) {
        /* add to error map */
        errors.push({ field, message: rule.message, value: val, where })
      }
    })

    return errors
  }

  /**
   * Formats a humanized string for min and max values
   * @param {object} opts - Options: min, max, noSpace
   */
  humanizeLimit (opts) {
    const space = opts.noSpace ? '' : ' '

    const leading = opts.min && opts.max ? `${space}between ` : (opts.min ? `${space}above ` : (opts.max ? `${space}below ` : ''))
    const trailing = `${opts.min || ''}${opts.min && opts.max ? ' and ' : ''}${opts.max || ''}`

    return leading + trailing
  }

  // ---------------------------------------------------------------------------
  // validators
  // ---------------------------------------------------------------------------

  required () {
    this.isRequired = true
    return this
  }

  contains (seed) {
    this.rules.push({
      message: `must contain '${seed}'`,
      validate: (val) => validator.contains(val, seed)
    })
    return this
  }

  equals (compare) {
    this.rules.push({
      message: `must be equal to '${compare}'`,
      validate: (val) => validator.equals(val, compare)
    })
    return this
  }

  isAfter (date) {
    date = new Date(date || Date.now())
    this.rules.push({
      message: `must be after ${new Date(date).toISOString()}`,
      validate: (val) => (new Date(val).getTime() > date.getTime())
    })
    return this
  }

  isAlpha (locale) {
    this.rules.push({
      message: 'must be contain alpha characters',
      validate: (val) => validator.isAlpha(val, locale)
    })
    return this
  }

  isAlphanumeric (locale) {
    this.rules.push({
      message: 'must be contain alphanumeric characters',
      validate: (val) => validator.isAlphanumeric(val, locale)
    })
    return this
  }

  isAscii () {
    this.rules.push({
      message: 'must be valid ASCII characters',
      validate: (val) => validator.isAscii(val)
    })
    return this
  }

  isBase64 () {
    this.rules.push({
      message: 'must be a valid base64 string',
      validate: (val) => validator.isBase64(val)
    })
    return this
  }

  isBefore (date) {
    date = new Date(date || Date.now())
    this.rules.push({
      message: `must be before ${new Date(date).toISOString()}`,
      validate: (val) => (new Date(val).getTime() < date.getTime())
    })
    return this
  }

  isBoolean () {
    this.rules.push({
      message: 'must be a boolean',
      validate: (val) => validator.isBoolean(String(val))
    })
    return this
  }

  isCurrency (opts) {
    this.rules.push({
      message: 'must be a valid currency',
      validate: (val) => validator.isCurrency(val, opts)
    })
    return this
  }

  isDataURI () {
    this.rules.push({
      message: 'must be a valid data URI',
      validate: (val) => validator.isDataURI(val)
    })
    return this
  }

  isDate () {
    this.rules.push({
      message: 'must be a valid date',
      validate: (val) => validator.isDate(val)
    })
    return this
  }

  isDivisibleBy (num) {
    this.rules.push({
      message: `must be divisible by ${num}`,
      validate: (val) => validator.isDivisibleBy(String(val), num)
    })
    return this
  }

  isEmail (opts) {
    this.rules.push({
      message: 'must be a valid email address',
      validate: (val) => validator.isEmail(val, opts)
    })
    return this
  }

  isFQDN (opts) {
    this.rules.push({
      message: 'must be a fully qualified domain name',
      validate: (val) => validator.isFQDN(val, opts)
    })
    return this
  }

  isIpAddress (ver) {
    this.rules.push({
      message: 'must be a valid IP address',
      validate: (val) => validator.isIP(val, ver)
    })
    return this
  }

  isEnum (values) {
    this.rules.push({
      message: `must be one of ${JSON.stringify(values)}`,
      validate: (val) => validator.isIn(String(val), values)
    })
    return this
  }

  isNumber (opts = {}) {
    const msg = this.humanizeLimit(opts)
    this.rules.push({
      message: `must be an integer${msg}`,
      validate: (val) => validator.isInt(String(val), opts)
    })
    return this
  }

  isJSON () {
    this.rules.push({
      message: 'must be valid JSON',
      validate: (val) => validator.isJSON(val)
    })
    return this
  }

  isLength (opts) {
    const msg = this.humanizeLimit({ ...opts, noSpace: true })
    this.rules.push({
      message: `must have byte length ${msg}`,
      validate: (val) => validator.isLength(val, opts)
    })
    return this
  }

  isLowercase () {
    this.rules.push({
      message: 'must be all lowercase letters',
      validate: (val) => validator.isLowercase(val)
    })
    return this
  }

  isMACAddress () {
    this.rules.push({
      message: 'must be a valid MAC address',
      validate: (val) => validator.isMACAddress(val)
    })
    return this
  }

  isPhoneNumber (locale) {
    this.rules.push({
      message: 'must be a valid phone number',
      validate: (val) => validator.isMobilePhone(val, locale)
    })
    return this
  }

  isMongoId () {
    this.rules.push({
      message: 'must be a valid mongo ID',
      validate: (val) => validator.isMongoId(val)
    })
    return this
  }

  isURL (opts) {
    this.rules.push({
      message: 'must be a valid URL',
      validate: (val) => validator.isURL(val, opts)
    })
    return this
  }

  isUUID (ver) {
    this.rules.push({
      message: 'must be a valid UUID',
      validate: (val) => validator.isUUID(val, ver)
    })
    return this
  }

  isUppercase () {
    this.rules.push({
      message: 'must be all uppercase letters',
      validate: (val) => validator.isUppercase(val)
    })
    return this
  }

  isWhitelisted (chars) {
    this.rules.push({
      message: 'must be whitelisted',
      validate: (val) => validator.isWhitelisted(String(val), chars)
    })
    return this
  }

  matches (pattern, mods) {
    this.rules.push({
      message: 'must be valid',
      validate: (val) => validator.matches(val, pattern, mods)
    })
    return this
  }
}

/* have to export the class and call with 'new' in the actual app. */
/* this is because rules get intertwined because of 'this.rules'. */

export default Validation
