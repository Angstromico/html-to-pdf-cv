const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const puppeteer = require('puppeteer')
const { exec } = require('child_process')

const app = express()
const PORT = 4000

// Middleware
app.use(bodyParser.json({ limit: '10mb' }))
app.use(express.static(__dirname, { index: false }))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Serve Dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'))
})

// Legacy Generation API (Executes existing scripts)
app.post('/api/generate', (req, res) => {
  const { type, lang } = req.body

  let command = ''
  let outputFile = ''

  if (type === 'standard') {
    if (lang === 'en') {
      command = 'node generate-pdf.js'
      outputFile = 'manuel-morales-resume.pdf'
    } else if (lang === 'es') {
      command = 'node ./es/index.js'
      outputFile = 'manuel-morales-resume-es.pdf'
    }
  } else if (type === 'harvard') {
    if (lang === 'en') {
      command = 'node generate-harvard-pdf.js en'
      outputFile = 'manuel-morales-harvard.pdf'
    } else if (lang === 'es') {
      command = 'node generate-harvard-pdf.js es'
      outputFile = 'manuel-morales-harvard-es.pdf'
    }
  }

  if (!command) {
    return res
      .status(400)
      .json({ success: false, error: 'Invalid configuration' })
  }

  console.log(`Executing: ${command}`)

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`)
      return res
        .status(500)
        .json({ success: false, error: error.message, details: stderr })
    }
    res.json({
      success: true,
      message: 'CV Generated Successfully',
      file: outputFile,
    })
  })
})

// Custom CV Generation API
app.post('/api/generate-custom', async (req, res) => {
  try {
    const data = req.body // Contains all CV data + type + lang
    const templateName = data.type === 'standard' ? 'standard' : 'harvard'
    const outputFile = `custom-${data.type}-${data.lang}.pdf`

    // Render EJS to HTML string
    const html = await new Promise((resolve, reject) => {
      app.render(templateName, data, (err, html) => {
        if (err) reject(err)
        else resolve(html)
      })
    })

    // Use Puppeteer to generate PDF
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfOptions = {
      path: outputFile,
      printBackground: true,
      format: 'Letter',
    }

    if (data.type === 'standard') {
      pdfOptions.width = '1500px'
      pdfOptions.height = '2500px'
      delete pdfOptions.format // Use dimensions for standard style to match legacy
      pdfOptions.pageRanges = '1'
    } else {
      pdfOptions.margin = {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
      }
    }

    await page.pdf(pdfOptions)
    await browser.close()

    console.log(`Generated Custom PDF: ${outputFile}`)
    res.json({ success: true, file: outputFile })
  } catch (error) {
    console.error('Custom Generation Error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`)
})
