#!/usr/bin/env node
/**
 * Contrôle visuel responsive — obligatoire avant toute livraison de site.
 *
 * Usage :
 *   node scripts/visual-check.mjs http://localhost:4699
 *
 * - Teste 3 breakpoints : 390 (mobile), 768 (tablette), 1440 (desktop)
 * - Échoue (exit 1) si débordement horizontal ou élément hors viewport
 * - Capture des screenshots de TOUTE la page dans /tmp/visual-check/
 *
 * ⚠️ Le script ne remplace pas l'œil : LIRE ensuite chaque capture
 *    (outil Read) — surtout les mobiles — avant de déclarer le site prêt.
 */

import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'

const PUPPETEER = '/Users/sloandesloriez/.npm/_npx/7d92d9a2d2ccc630/node_modules/puppeteer'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const url = process.argv[2]
if (!url) {
  console.error('Usage: node scripts/visual-check.mjs <url>')
  process.exit(2)
}

const BREAKPOINTS = [
  { name: 'mobile-390', width: 390, height: 844, isMobile: true },
  { name: 'tablet-768', width: 768, height: 1024, isMobile: true },
  { name: 'desktop-1440', width: 1440, height: 900, isMobile: false },
]

const require = createRequire(import.meta.url)
const puppeteer = require(PUPPETEER)
mkdirSync('/tmp/visual-check', { recursive: true })

const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--no-sandbox'] })
const page = await browser.newPage()
let failed = false
const shots = []

for (const bp of BREAKPOINTS) {
  await page.setViewport({
    width: bp.width, height: bp.height,
    deviceScaleFactor: 2, isMobile: bp.isMobile, hasTouch: bp.isMobile,
  })
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 })
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto' })

  // déclenche les animations whileInView
  const H = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < H; y += 500) {
    await page.evaluate(yy => scrollTo(0, yy), y)
    await new Promise(r => setTimeout(r, 150))
  }

  // détection de débordements
  const audit = await page.evaluate(() => {
    const offenders = []
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && (r.right > innerWidth + 1 || r.left < -1)) {
        offenders.push(`${el.tagName}.${String(el.className).slice(0, 70)} [${Math.round(r.left)}→${Math.round(r.right)}]`)
      }
    })
    return {
      scrollW: document.documentElement.scrollWidth,
      innerW: innerWidth,
      offenders: [...new Set(offenders)].slice(0, 10),
    }
  })

  const overflow = audit.scrollW > audit.innerW || audit.offenders.length > 0
  if (overflow) failed = true
  console.log(`[${bp.name}] scrollWidth=${audit.scrollW} viewport=${audit.innerW} ${overflow ? '❌ DÉBORDEMENT' : '✓'}`)
  audit.offenders.forEach(o => console.log(`   ↳ ${o}`))

  // captures pleine page par tranches
  for (let i = 0; i * 820 < H; i++) {
    await page.evaluate(yy => scrollTo(0, yy), i * 820)
    await new Promise(r => setTimeout(r, 350))
    const path = `/tmp/visual-check/${bp.name}-${i}.png`
    await page.screenshot({ path })
    shots.push(path)
  }
}

await browser.close()

console.log(`\n${shots.length} captures dans /tmp/visual-check/`)
console.log('⚠️  LIRE chaque capture (surtout mobile) avant de livrer — le script ne voit pas tout.')
if (failed) {
  console.log('\n❌ ÉCHEC : débordement détecté — corriger avant de continuer.')
  process.exit(1)
}
console.log('\n✓ Aucun débordement détecté sur les 3 breakpoints.')
