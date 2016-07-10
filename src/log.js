import Chalk from 'chalk'
import config from './config'

export default function (tag, ...msg) {
  /* make sure log tag is enabled */
  if (!config.logs || config.logs.indexOf(tag) === -1) {
    return () => {}
  }

  /* enable or disable color */
  const chalk = new Chalk.constructor({ enabled: config.logColors })

  if (msg.length) {
    const timestamp = config.logTimestamp
      ? ' ' + chalk.cyan(`${new Date().toISOString()}`)
      : ''

    const message = tag === 'error'
      ? chalk.red(...msg)
      : `${chalk.dim(config.name)}${timestamp} ${msg.join(' ')}`

    process.stdout.write(message)
  }

  return (code) => {
    if (code && tag === 'request') {
      /* if the log is a request log, this outputs the statusCode after the request complets */
      const statusCode = code >= 400 ? chalk.red(code) : chalk.green(code)
      process.stdout.write(` - ${statusCode}`)
    }

    process.stdout.write('\n')
  }
}
