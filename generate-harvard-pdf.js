const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const lang = process.argv[2] || 'en'

;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  let htmlFile = 'harvard-index.html'
  let pdfFile = 'manuel-morales-harvard.pdf'

  if (lang === 'es') {
    htmlFile = 'es/harvard-index.html'
    pdfFile = 'manuel-morales-harvard-es.pdf'
  }

  const htmlPath = path.join(__dirname, htmlFile)
  const html = fs.readFileSync(htmlPath, 'utf8')

  // We need to set the content. For local files with relative links (if any),
  // it's often safer to use a file:// url or just setContent.
  // Since the HTML is simple and self-contained (except maybe fonts), setContent is fine.
  await page.setContent(html, { waitUntil: 'networkidle0' })

  await page.pdf({
    path: pdfFile,
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.5in',
      left: '0.5in',
    },
  })

  console.log(`Generated ${pdfFile}`)

  await browser.close()
})()
