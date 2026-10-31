// Build the static site into dist/ and stamp a content hash for traceability.

import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const src = join(root, 'src')
const dist = join(root, 'dist')

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(full)))
    else if (entry.isFile()) files.push(full)
  }
  return files
}

async function main() {
  const started = Date.now()
  const info = await stat(src).catch(() => null)
  if (!info?.isDirectory()) throw new Error(`Missing source directory: ${src}`)

  await rm(dist, { recursive: true, force: true })
  await mkdir(dist, { recursive: true })
  await cp(src, dist, { recursive: true })

  const files = (await walk(dist)).sort()
  const hash = createHash('sha256')
  let bytes = 0
  for (const file of files) {
    const content = await stat(file)
    bytes += content.size
    hash.update(relative(dist, file))
    hash.update(await readFile(file))
  }

  await writeFile(join(dist, 'build.json'), `${JSON.stringify({
    builtAt: new Date().toISOString(),
    hash: hash.digest('hex').slice(0, 16),
    files: files.length,
    bytes,
  }, null, 2)}\n`)

  if (!files.some((file) => file === join(dist, 'index.html'))) throw new Error('Build produced no index.html')
  console.log(`[build] ${files.length} files, ${(bytes / 1024).toFixed(1)} KiB, ${Date.now() - started}ms -> ${relative(root, dist)}/`)
}

main().catch((error) => {
  console.error(`[build] ${error.message}`)
  process.exit(1)
})
