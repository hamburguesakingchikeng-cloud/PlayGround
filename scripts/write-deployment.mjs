// Publish the built directory to the worker controller.

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const project = resolve(process.env.PROJECT_DIR || process.cwd())
const directory = resolve(project, 'dist')
const webDir = process.env.OPENCODE_WEB_DIR || '/home/runner/work/_temp/omgithub-web'

if (!existsSync(join(directory, 'index.html'))) {
  console.error(`[metadata] ${join(directory, 'index.html')} is missing; run the build first`)
  process.exit(1)
}
if (!directory.startsWith(project + '/')) {
  console.error(`[metadata] ${directory} is outside ${project}`)
  process.exit(1)
}

mkdirSync(webDir, { recursive: true })
const target = join(webDir, 'deployment-output.json')
writeFileSync(target, `${JSON.stringify({ project, directory })}\n`)
console.log(`[metadata] ${target} -> ${directory}`)
