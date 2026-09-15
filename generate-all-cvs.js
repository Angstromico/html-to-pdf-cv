/**
 * Unified CV Generator & Validator
 *
 * Blazingly fast PDF generator that uses a single Puppeteer browser instance
 * to render and validate all Curriculum Vitae formats across English and Spanish.
 *
 * Usage:
 *   node generate-all-cvs.js              # Generate all CVs and report summary
 *   node generate-all-cvs.js --validate   # Generate and enforce page count budgets
 *   node generate-all-cvs.js --en         # Generate English CVs only
 *   node generate-all-cvs.js --es         # Generate Spanish CVs only
 */

const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

const args = process.argv.slice(2)
const isValidateMode = args.includes('--validate') || args.includes('--check')
const filterEn = args.includes('--en')
const filterEs = args.includes('--es')

const CV_CONFIGS = [
  {
    id: 'resume-en',
    name: 'Standard CV (English)',
    source: 'index.html',
    output: 'manuel-morales-resume.pdf',
    lang: 'en',
    maxPages: 2,
    expectedPages: 2,
    pdfOptions: {
      path: 'manuel-morales-resume.pdf',
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    },
  },
  {
    id: 'resume-es',
    name: 'Standard CV (Spanish - Long Canvas)',
    source: 'es/index.html',
    output: 'manuel-morales-resume-es.pdf',
    lang: 'es',
    maxPages: 1,
    expectedPages: 1,
    pdfOptions: {
      path: 'manuel-morales-resume-es.pdf',
      width: '1500px',
      height: '2900px',
      printBackground: true,
      pageRanges: '1',
    },
  },
  {
    id: 'resume-es-short',
    name: 'Short Resume (Spanish - Single Page)',
    source: 'es/index-short.html',
    output: 'manuel-morales-resume-es-short.pdf',
    lang: 'es',
    maxPages: 1,
    expectedPages: 1,
    pdfOptions: {
      path: 'manuel-morales-resume-es-short.pdf',
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
      pageRanges: '1',
    },
  },
  {
    id: 'harvard-en',
    name: 'Harvard Format (English ATS)',
    source: 'harvard-index.html',
    output: 'manuel-morales-harvard.pdf',
    lang: 'en',
    maxPages: 2,
    expectedPages: 2,
    pdfOptions: {
      path: 'manuel-morales-harvard.pdf',
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
      },
    },
  },
  {
    id: 'harvard-es',
    name: 'Harvard Format (Spanish ATS)',
    source: 'es/harvard-index.html',
    output: 'manuel-morales-harvard-es.pdf',
    lang: 'es',
    maxPages: 2,
    expectedPages: 2,
    pdfOptions: {
      path: 'manuel-morales-harvard-es.pdf',
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
      },
    },
  },
]

function getPdfPageCount(filePath) {
  try {
    const buffer = fs.readFileSync(filePath).toString('latin1')
    const matches = buffer.match(/\/Type\s*\/Page\b/g)
    return matches ? matches.length : null
  } catch {
    return null
  }
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

async function run() {
  const startTime = Date.now()
  let targetConfigs = CV_CONFIGS

  if (filterEn && !filterEs) {
    targetConfigs = CV_CONFIGS.filter((c) => c.lang === 'en')
  } else if (filterEs && !filterEn) {
    targetConfigs = CV_CONFIGS.filter((c) => c.lang === 'es')
  }

  console.log(`\n📄 CV Generator & Harness Runner`)
  console.log(`Targeting ${targetConfigs.length} CV document(s)...\n`)

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  const results = []
  let hasErrors = false

  for (const config of targetConfigs) {
    const sourcePath = path.resolve(__dirname, config.source)
    const fileUrl = 'file:///' + sourcePath.replace(/\\/g, '/')

    process.stdout.write(`  Rendering [${config.lang.toUpperCase()}] ${config.name}... `)

    try {
      if (!fs.existsSync(sourcePath)) {
        throw new Error(`Source file not found: ${config.source}`)
      }

      await page.goto(fileUrl, { waitUntil: 'networkidle0' })
      await page.pdf(config.pdfOptions)

      const outputPath = path.resolve(__dirname, config.output)
      const stats = fs.statSync(outputPath)
      const pageCount = getPdfPageCount(outputPath)

      const exceedsBudget = config.maxPages && pageCount > config.maxPages

      if (exceedsBudget) {
        hasErrors = true
        console.log(`⚠️  OVERFLOW (${pageCount} pgs, max: ${config.maxPages})`)
      } else {
        console.log(`✔ OK (${pageCount} pgs, ${formatBytes(stats.size)})`)
      }

      results.push({
        name: config.name,
        source: config.source,
        output: config.output,
        pages: pageCount,
        maxPages: config.maxPages,
        size: formatBytes(stats.size),
        status: exceedsBudget ? 'OVERFLOW' : 'OK',
      })
    } catch (err) {
      hasErrors = true
      console.log(`✖ FAILED: ${err.message}`)
      results.push({
        name: config.name,
        source: config.source,
        output: config.output,
        pages: 'N/A',
        maxPages: config.maxPages,
        size: 'N/A',
        status: `ERROR: ${err.message}`,
      })
    }
  }

  await browser.close()
  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  console.log(`\n================ Summary Table ================`)
  console.table(
    results.map((r) => ({
      Document: r.name,
      File: r.output,
      Pages: `${r.pages}/${r.maxPages || 'auto'}`,
      Size: r.size,
      Status: r.status,
    }))
  )
  console.log(`Completed in ${duration}s.\n`)

  if (isValidateMode && hasErrors) {
    console.error('Validation failed: Some CVs exceeded page budget or had errors.')
    process.exit(1)
  }
}

run().catch((err) => {
  console.error('Fatal execution error:', err)
  process.exit(1)
})
