import chalk from 'chalk'
import Server from '../index'
import { log, logo, hideCursor } from '../utils/emit'

export default async function (argv) {
  const app = new Server()

  return app.start().then((url) => {
    hideCursor()
    logo()
    log(`Running at ${chalk.underline(url)}`)

    return url
  })
}
