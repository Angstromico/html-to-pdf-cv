/**
 * Unified CV Generator & Validator
 *
 * Blazingly fast PDF generator that uses a single Puppeteer browser instance
 * to render and validate all Curriculum Vitae formats across English and Spanish.
 *
 * Usage:
 *   node generate-all-cvs.js                           # Generate all CVs and report summary
 *   node generate-all-cvs.js --validate                # Generate and enforce page count budgets
 *   node generate-all-cvs.js harvard                   # Generate Harvard formats (EN & ES)
 *   node generate-all-cvs.js standard                  # Generate Standard formats (EN & ES)
 *   node generate-all-cvs.js en                        # Generate English CVs only
 *   node generate-all-cvs.js es                        # Generate Spanish CVs only
 *   node generate-all-cvs.js harvard en                # Generate Harvard format in English only
 *   node generate-all-cvs.js standard es               # Generate Standard format in Spanish only
 *   node generate-all-cvs.js create                    # Compiles Harvard & Standard (4 outputs)
 *   node generate-all-cvs.js --source-dir <dir>        # Read HTML sources from staging dir (e.g. .temp)
 */

const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

const rawArgs = process.argv.slice(2)
const normalizedArgs = rawArgs.map((a) => a.toLowerCase().replace(/^--?/, ''))

const isValidateMode = normalizedArgs.includes('validate') || normalizedArgs.includes('check')
const filterHarvard = normalizedArgs.includes('harvard')
const filterStandard = normalizedArgs.includes('standard')
const filterShort = normalizedArgs.includes('short')
const filterEn = normalizedArgs.includes('en')
const filterEs = normalizedArgs.includes('es')
const isCreateCommand = normalizedArgs.includes('create')

// Source directory override (e.g. .temp or custom staging path)
let sourceDir = __dirname
const sourceDirFlagIndex = rawArgs.findIndex((a) => a === '--source-dir' || a === '--temp')
if (sourceDirFlagIndex !== -1) {
  if (rawArgs[sourceDirFlagIndex] === '--temp') {
    sourceDir = path.resolve(__dirname, '.temp')
  } else if (rawArgs[sourceDirFlagIndex + 1]) {
    sourceDir = path.resolve(__dirname, rawArgs[sourceDirFlagIndex + 1])
  }
}

// Output directory override (e.g. dist/ or custom path)
let outputDir = __dirname
const outputDirFlagIndex = rawArgs.findIndex((a) => a === '--output-dir' || a === '--out')
if (outputDirFlagIndex !== -1 && rawArgs[outputDirFlagIndex + 1]) {
  outputDir = path.resolve(__dirname, rawArgs[outputDirFlagIndex + 1])
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
}

const CV_CONFIGS = [
  {
    id: 'resume-en',
    name: 'Standard CV (English)',
    formatType: 'standard',
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
    formatType: 'standard',
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
    formatType: 'short',
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
    formatType: 'harvard',
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
    formatType: 'harvard',
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
  let targetConfigs = [...CV_CONFIGS]

  const isFiltered = filterHarvard || filterStandard || filterShort || filterEn || filterEs || isCreateCommand
  const includeShort = filterShort || (!isFiltered && !isCreateCommand)

  if (!includeShort) {
    targetConfigs = targetConfigs.filter((c) => c.id !== 'resume-es-short')
  }

  // Filter by format
  if (filterHarvard && !filterStandard && !filterShort) {
    targetConfigs = targetConfigs.filter((c) => c.formatType === 'harvard')
  } else if (filterStandard && !filterHarvard) {
    targetConfigs = targetConfigs.filter((c) => c.formatType === 'standard')
  } else if (filterShort) {
    targetConfigs = targetConfigs.filter((c) => c.formatType === 'short')
  } else if (isCreateCommand) {
    // Default create: compiles Harvard (EN/ES) and Standard (EN/ES) [4 outputs total]
    targetConfigs = targetConfigs.filter((c) => c.formatType === 'harvard' || c.formatType === 'standard')
  }

  // Filter by language
  if (filterEn && !filterEs) {
    targetConfigs = targetConfigs.filter((c) => c.lang === 'en')
  } else if (filterEs && !filterEn) {
    targetConfigs = targetConfigs.filter((c) => c.lang === 'es')
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
    let sourcePath = path.resolve(sourceDir, config.source)
    if (!fs.existsSync(sourcePath)) {
      sourcePath = path.resolve(__dirname, config.source)
    }
    const fileUrl = 'file:///' + sourcePath.replace(/\\/g, '/')
    const outputPath = path.resolve(outputDir, config.output)
    const effectivePdfOptions = { ...config.pdfOptions, path: outputPath }

    process.stdout.write(`  Rendering [${config.lang.toUpperCase()}] ${config.name}... `)

    try {
      if (!fs.existsSync(sourcePath)) {
        throw new Error(`Source file not found: ${config.source}`)
      }

      await page.goto(fileUrl, { waitUntil: 'networkidle0' })
      await page.pdf(effectivePdfOptions)

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
        source: path.relative(__dirname, sourcePath),
        output: path.relative(__dirname, outputPath),
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
