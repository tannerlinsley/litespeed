import fs from 'fs-extra'
import config from './config'
import { createRoute } from './router'

export default async function () {
  const endpoints = config._routeMap

  fs.ensureDirSync('.lightrail')
  fs.outputJsonSync('.lightrail/endpoints.json', endpoints)

  createRoute({
    method: 'GET',
    url: config.documentationUrl,
    async handler (req, res) {
      const contents = await new Promise((resolve, reject) => {
        fs.readJson('.lightrail/endpoints.json', 'utf8', (err, data) => {
          if (err) reject(err)
          else resolve(data)
        })
      })

      return contents
      // return '<html><body>Hi</body></html>'
    }
  })
}
