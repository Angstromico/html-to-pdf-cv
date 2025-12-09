const puppeteer = require('puppeteer')
const path = require('path')

;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  const htmlPath = path.join(__dirname, '../es/index.html')

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' })

  await page.pdf({
    path: 'manuel-morales-resume-es.pdf',
    width: '1500px',
    height: '2400px',
    printBackground: true,
    pageRanges: '1',
  })

  await browser.close()
})()
