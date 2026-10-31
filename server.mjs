// Minimal static file server for the built site. Runs in the foreground.

import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(join(dirname(fileURLToPath(import.meta.url)), 'dist'))
const port = Number(process.env.PORT || 3000)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

function sendFile(req, res, file) {
  const info = statSync(file)
  res.writeHead(200, {
    'Content-Type': MIME[extname(file)] || 'application/octet-stream',
    'Content-Length': info.size,
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  })
  if (req.method === 'HEAD') return res.end()
  const stream = createReadStream(file)
  stream.on('error', () => res.destroy())
  stream.pipe(res)
  return undefined
}

const server = createServer((req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost')
    if (url.pathname === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' })
      return res.end('ok\n')
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' })
      return res.end('Method not allowed\n')
    }

    const pathname = decodeURIComponent(url.pathname)
    const candidate = normalize(join(root, pathname))
    if (candidate !== root && !candidate.startsWith(root + sep)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      return res.end('Not found\n')
    }

    let file = candidate
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
    if (!existsSync(file) || !statSync(file).isFile()) {
      if (!extname(pathname)) file = join(root, 'index.html')
      else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
        return res.end('Not found\n')
      }
    }
    return sendFile(req, res, file)
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    return res.end('Internal error\n')
  }
})

server.on('error', (error) => {
  console.error(`[server] ${error.message}`)
  process.exit(1)
})

server.listen(port, '0.0.0.0', () => {
  console.log(`[server] serving ${root} at http://0.0.0.0:${port}`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`[server] ${signal}, shutting down`)
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(0), 2000).unref()
  })
}
