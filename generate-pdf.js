const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8')
  await page.setContent(html, { waitUntil: 'networkidle0' })

  await page.pdf({
    path: 'manuel-morales-resume.pdf',
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm',
    },
  })

  await browser.close()
})()
