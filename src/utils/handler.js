import { fingerprint } from './router'

export default function (routes, request, response) {
  const route = routes[fingerprint(request)]

  if (!route) {
    response.writeHead(404, { 'Content-Type': 'text/html' })
    return response.end()
  }

  if (!route.handler) {
    throw new Error(`no handler found for ${route.url}`)
  }

  const data = []
  request.on('data', (chunk) => data.push(chunk))
  request.on('error', (err) => console.error(err))
  request.on('end', () => {
    response.on('error', (err) => console.error(err))

    const body = Buffer.concat(data).toString()
    const headers = request.headers

    route.handler({ body, headers })
      .then((data) => {
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.write(JSON.stringify(data))
        response.end()
      }).catch((err) => {
        response.writeHead(500, { 'Content-Type': 'application/json' })
        response.write(err)
        response.end()
      })
  })
}
