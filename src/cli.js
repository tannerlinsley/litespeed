import minimist from 'minimist'

export default async function () {
  try {
    const argv = minimist(process.argv.slice(2))

    switch (argv._[0]) {
      // case 'init':
      //   await require('./cmds/init').default(argv)
      //   break
      case 'server':
        await require('./cmds/server').default(argv)
        break
      default:
        console.log(`"${argv._[0]}" is not a command!`)
        break
    }
  } catch (err) {
    console.log(err)
  }
}
