const puppeteer = require('puppeteer')
const express = require('express')
const path = require('path')

const app = express()
app.use(express.static(path.join(__dirname, '..')))

const server = app.listen(5000, async () => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto('http://localhost:5000/es/index-short.html', {
      waitUntil: 'networkidle0',
    })

    await page.pdf({
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
    })

    await browser.close()
    server.close()
  } catch (error) {
    console.error(error)
    server.close()
    process.exit(1)
  }
})
