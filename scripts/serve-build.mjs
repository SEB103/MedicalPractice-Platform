import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../dist/', import.meta.url))
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.json': 'application/json' }
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname)
    let file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname))
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) { res.writeHead(403).end(); return }
    if (!(await stat(file)).isFile()) { res.writeHead(404).end(); return }
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' })
    res.end(await readFile(file))
  } catch { res.writeHead(404).end('Not found') }
}).listen(4173, '127.0.0.1', () => console.log('MedicalPractice: http://localhost:4173 (Ctrl+C to stop)'))
