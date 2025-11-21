const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  const html = fs.readFileSync(path.join(__dirname, '../es/index.html'), 'utf8')
  await page.setContent(html, { waitUntil: 'networkidle0' })

  await page.pdf({
    path: 'manuel-morales-resume-es.pdf',
    width: '1500px',
    height: '2400px',
    printBackground: true,
    pageRanges: '1',
  })

  await browser.close()
})()
