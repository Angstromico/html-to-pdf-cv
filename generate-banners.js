const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const lang = process.argv[2] || 'en'

;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  let htmlFile = 'banner.html'
  let pngFile = 'banner-en.png'

  if (lang === 'es') {
    htmlFile = 'es/banner.html'
    pngFile = 'banner-es.png'
  }

  const htmlPath = path.join(__dirname, htmlFile)
  const html = fs.readFileSync(htmlPath, 'utf8')

  await page.setViewport({ width: 1200, height: 628, deviceScaleFactor: 2 })
  await page.setContent(html, { waitUntil: 'networkidle0' })

  await page.screenshot({
    path: pngFile,
    type: 'png',
  })

  console.log(`Generated ${pngFile}`)

  await browser.close()
})()
