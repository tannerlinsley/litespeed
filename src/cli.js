import minimist from 'minimist'
import { error } from './utils/emit'

export default async function () {
  try {
    const argv = minimist(process.argv.slice(2))

    switch (argv._[0]) {
      // case 'init':
      //   await require('./cmds/init').default(argv)
      //   break
      case 'start':
        await require('./cmds/start').default(argv)
        break
      default:
        error(`"${argv._[0]}" is not an Airflow command!`)
        break
    }
  } catch (err) {
    error(err)
  }
}
