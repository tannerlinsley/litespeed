import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import exitHook from 'exit-hook'

export function error (msg, exit = true) {
  console.error(chalk.red(msg))
  if (exit) process.exit(1)
}

export function log (msg) {
  console.log(chalk.cyan(msg))
}

export function logo () {
  const filepath = path.resolve(__dirname, '../../assets/logo.txt')
  const data = fs.readFileSync(filepath, 'utf8')

  console.log()
  console.log(chalk.cyan.bold(data))
}

export function hideCursor () {
  process.stdout.write('\x1B[?25l')
}

exitHook(showCursor)
export function showCursor () {
  process.stdout.write('\x1B[?25h')
}
