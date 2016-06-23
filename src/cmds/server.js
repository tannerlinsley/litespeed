import http from 'http'
import { getRoutes, fingerprint } from '../utils/router'

export default async function (argv) {
  const routes = await getRoutes()
  const server = http.createServer((req, res) => serverHandler(routes, req, res))

  server.on('clientError', (err, socket) => {
    console.error('error:', err)
    socket.end('HTTP/1.1 400 Bad Request\n')
  })

  server.listen(8000, () => {
    console.log('server started')
  })
}

export async function serverHandler (routes, request, response) {
  const route = routes[fingerprint(request)]

  if (!route) {
    response.writeHead(404, { 'Content-Type': 'text/html' })
    return response.end()
  }

  if (!route.handler) {
    throw new Error(`no handler found for ${route.path}`)
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
