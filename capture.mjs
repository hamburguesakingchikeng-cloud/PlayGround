// Capture desktop and mobile screenshots of the running preview with Playwright.
// Exit codes: 75 = temporary browser/navigation infrastructure failure, 1 = script or rendering defect.

import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const started = Date.now()
const log = (message) => console.log(`[capture +${((Date.now() - started) / 1000).toFixed(1)}s] ${message}`)

class CaptureError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}

const defect = (message) => new CaptureError(message, 1)
const transient = (message, cause) => {
  const error = new CaptureError(message, 75)
  error.cause = cause
  return error
}

const url = (process.env.CAPTURE_URL || '').trim()
const outDir = (process.env.CAPTURE_DIR || '').trim()

if (!url || !outDir) {
  console.error('[capture] CAPTURE_URL and CAPTURE_DIR are required')
  process.exit(1)
}

let parsed
try {
  parsed = new URL(url)
} catch {
  console.error(`[capture] CAPTURE_URL is not a valid URL: ${url}`)
  process.exit(1)
}
if (!/^https?:$/.test(parsed.protocol)) {
  console.error('[capture] CAPTURE_URL must be http(s)')
  process.exit(1)
}

const project = resolve(process.env.PROJECT_DIR || process.cwd())
const output = resolve(outDir)
if (output === project || output.startsWith(project + '/')) {
  log(`warning: CAPTURE_DIR (${output}) is inside the project; screenshots are not part of the build`)
}

const runtime = join(process.env.HOME || '', '.local/share/omgithub-playwright')
if (!existsSync(join(runtime, 'node_modules/playwright'))) {
  console.error(`[capture] Playwright runtime missing at ${runtime}`)
  process.exit(75)
}

const require = createRequire(join(runtime, 'package.json'))
const { chromium } = require('playwright')
const configFile = join(runtime, process.platform === 'darwin' ? 'metal.json' : 'linux.json')
const config = JSON.parse(readFileSync(configFile, 'utf8'))
if (process.platform === 'linux') {
  process.env.DISPLAY ||= ':' + readFileSync(join(runtime, 'display'), 'utf8').trim()
}

const VIEWS = [
  {
    name: 'desktop',
    context: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  },
  {
    name: 'mobile',
    context: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  },
]

function isFirstParty(requestUrl) {
  try {
    return new URL(requestUrl).origin === parsed.origin
  } catch {
    return false
  }
}

async function assertPainted(page) {
  const stats = await page.evaluate(() => {
    const canvas = document.querySelector('#app canvas')
    if (!canvas) return null
    const sample = document.createElement('canvas')
    sample.width = 64
    sample.height = 64
    const ctx = sample.getContext('2d')
    ctx.drawImage(canvas, 0, 0, 64, 64)
    const data = ctx.getImageData(0, 0, 64, 64).data
    let min = 255
    let max = 0
    let sum = 0
    for (let i = 0; i < data.length; i += 4) {
      const value = (data[i] + data[i + 1] + data[i + 2]) / 3
      min = Math.min(min, value)
      max = Math.max(max, value)
      sum += value
    }
    return { min, max, avg: sum / (data.length / 4) }
  })
  if (!stats) throw defect('the game canvas is missing')
  if (stats.max - stats.min < 10 || stats.avg < 3) {
    throw defect(`the game canvas looks blank (min=${stats.min.toFixed(1)} max=${stats.max.toFixed(1)} avg=${stats.avg.toFixed(1)})`)
  }
  return stats
}

async function captureView(browser, view, autoStart) {
  const context = await browser
    .newContext({ ...view.context, locale: 'es-ES', colorScheme: 'dark', reducedMotion: 'no-preference' })
    .catch((error) => {
      throw transient(`could not create ${view.name} browser context: ${error.message}`, error)
    })

  const page = await context.newPage()
  const issues = []

  page.on('pageerror', (error) => issues.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') issues.push(`console: ${message.text()}`)
  })
  page.on('requestfailed', (request) => {
    if (isFirstParty(request.url())) issues.push(`requestfailed: ${request.url()} (${request.failure()?.errorText || 'unknown'})`)
  })
  page.on('response', (response) => {
    if (isFirstParty(response.url()) && response.status() >= 400) issues.push(`HTTP ${response.status()} ${response.url()}`)
  })

  log(`open ${url} (${view.name})`)
  let response
  try {
    response = await page.goto(url, { waitUntil: 'load', timeout: 45000 })
  } catch (error) {
    throw transient(`navigation failed for ${view.name}: ${error.message}`, error)
  }
  if (!response) throw transient(`navigation returned no response for ${view.name}`)

  const status = response.status()
  if (status >= 400) {
    const message = `HTTP ${status} loading ${url} (${view.name})`
    if ([408, 429, 500, 502, 503, 504].includes(status)) throw transient(message)
    throw defect(message)
  }

  await page.waitForSelector('#app canvas', { state: 'visible', timeout: 15000 }).catch((error) => {
    throw defect(`game canvas never became visible (${view.name}): ${error.message}`)
  })
  await page.waitForFunction(() => window.__gameReady === true, undefined, { timeout: 20000 }).catch((error) => {
    throw defect(`the game never finished its first frame (${view.name}): ${error.message}`)
  })
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))

  if (autoStart) {
    await page.click('#btn-new', { timeout: 5000 }).catch((error) => {
      throw defect(`could not start a new game (${view.name}): ${error.message}`)
    })
    await page.waitForSelector('#hud:not(.hidden)', { timeout: 8000 }).catch((error) => {
      throw defect(`the HUD did not appear after starting (${view.name}): ${error.message}`)
    })
    await page.waitForTimeout(900)
  }

  const layers = await page.evaluate(() => {
    const visible = (selector) => {
      const element = document.querySelector(selector)
      return Boolean(element) && !element.classList.contains('hidden') && element.getBoundingClientRect().width > 0
    }
    return { title: visible('#screen-title'), hud: visible('#hud') }
  })
  if (!layers.title && !layers.hud) throw defect(`neither the title screen nor the HUD is visible (${view.name})`)

  const stats = await assertPainted(page)
  log(`${view.name}: canvas min=${stats.min.toFixed(0)} max=${stats.max.toFixed(0)} avg=${stats.avg.toFixed(0)}`)

  const file = join(output, `final-${view.name}.png`)
  await page.screenshot({ path: file, timeout: 30000, caret: 'hide' }).catch((error) => {
    if (/closed|disconnected|Target/i.test(error.message)) throw transient(`browser closed while capturing ${view.name}`, error)
    throw defect(`screenshot failed (${view.name}): ${error.message}`)
  })
  log(`saved ${file}`)

  if (issues.length) {
    throw defect(`${view.name} reported rendering errors: ${issues.slice(0, 5).join(' | ')}`)
  }

  await context.close().catch(() => {})
  return file
}

async function main() {
  const autoStart = process.env.CAPTURE_AUTO_START === '1'
  mkdirSync(output, { recursive: true })

  log(`launch chromium${autoStart ? ' (auto-start)' : ''}`)
  let browser
  try {
    browser = await chromium.launch({ ...config.browser.launchOptions, timeout: 30000 }).catch((error) => {
      throw transient(`browser launch failed: ${error.message}`, error)
    })
    for (const view of VIEWS) await captureView(browser, view, autoStart)
    log('capture complete')
  } finally {
    if (browser) await browser.close().catch((error) => console.error(`[capture] close: ${error.message}`))
  }
}

main().catch((error) => {
  console.error(`[capture] ${error?.message || error}`)
  if (error?.cause) console.error(`[capture] cause: ${error.cause.message || error.cause}`)
  process.exitCode = error?.code || 1
})
