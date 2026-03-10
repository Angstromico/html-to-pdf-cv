const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

const generateHTML = (data) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Letter of Recommendation</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: white;
        }
        h1 {
          text-align: center;
        }
        .header {
            text-align: right;
            margin-bottom: 50px;
        }
        .date {
            margin-bottom: 30px;
        }
        .recipient {
            margin-bottom: 30px;
        }
        .salutation {
            margin-bottom: 20px;
        }
        .content {
            text-align: justify;
            margin-bottom: 30px;
        }
        .closing {
            margin-top: 50px;
        }
        .signature {
            margin-top: 50px;
            border-top: 1px solid #333;
            padding-top: 10px;
            width: 300px;
        }
        .contact-info {
            margin-top: 10px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Personal Reference</h1>
    </div>
    h
    <div class="date">
        <p>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    
    <div class="recipient">
        <p>To Whom It May Concern:</p>
    </div>
    
    <div class="salutation">
        <p>Dear Hiring Manager,</p>
    </div>
    
    <div class="content">
        <p>It is with great pleasure that I write this letter of recommendation for ${data.recommendedName}. I have had the privilege of working with ${data.recommendedName} during my time as ${data.recommenderTitle} at ${data.company}, and I can confidently say that they are one of the most exceptional individuals I have encountered in my professional career.</p>
        
        <p>During our time working together, ${data.recommendedName} demonstrated outstanding professional qualities including strong work ethic, excellent problem-solving skills, and the ability to work effectively both independently and as part of a team. Their dedication to excellence and attention to detail consistently impressed me and their colleagues.</p>
        
        <p>${data.recommendedName} possesses remarkable interpersonal skills and the ability to communicate effectively with people at all levels. Their positive attitude and willingness to go above and beyond expectations make them an invaluable asset to any organization.</p>
        
        <p>I wholeheartedly recommend ${data.recommendedName} without any reservations. I am confident that they will be an excellent addition to your team and will contribute significantly to your organization's success.</p>
        
        <p>Please feel free to contact me if you require any additional information.</p>
    </div>
    
    <div class="closing">
        <p>Sincerely,</p>
        <div class="signature">
            <p>${data.recommenderName}</p>
            <p>${data.recommenderTitle}</p>
            <p>${data.company}</p>
            <div class="contact-info">
                <p>Phone: ${data.recommenderPhone}</p>
            </div>
        </div>
    </div>
</body>
</html>`
}

const generateDOCX = async (data) => {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx')

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: data.recommenderTitle,
                bold: true,
              }),
            ],
            alignment: 'right',
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.company,
              }),
            ],
            alignment: 'right',
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.recommenderPhone,
              }),
            ],
            alignment: 'right',
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }),
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'To Whom It May Concern:',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Dear Hiring Manager,',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `It is with great pleasure that I write this letter of recommendation for ${data.recommendedName}. I have had the privilege of working with ${data.recommendedName} during my time as ${data.recommenderTitle} at ${data.company}, and I can confidently say that they are one of the most exceptional individuals I have encountered in my professional career.`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `During our time working together, ${data.recommendedName} demonstrated outstanding professional qualities including strong work ethic, excellent problem-solving skills, and the ability to work effectively both independently and as part of a team. Their dedication to excellence and attention to detail consistently impressed me and their colleagues.`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${data.recommendedName} possesses remarkable interpersonal skills and the ability to communicate effectively with people at all levels. Their positive attitude and willingness to go above and beyond expectations make them an invaluable asset to any organization.`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `I wholeheartedly recommend ${data.recommendedName} without any reservations. I am confident that they will be an excellent addition to your team and will contribute significantly to your organization's success.`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Please feel free to contact me if you require any additional information.',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Sincerely,',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.recommenderName,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.recommenderTitle,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.company,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Phone: ${data.recommenderPhone}`,
              }),
            ],
          }),
        ],
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(
    `${data.recommendedName.toLowerCase().replace(/\s+/g, '-')}-recommendation.docx`,
    buffer,
  )
}

;(async () => {
  console.log('=== Letter of Recommendation Generator (English) ===\n')

  const data = {
    recommenderName: await question('Enter recommender name: '),
    recommendedName: await question('Enter person being recommended name: '),
    recommenderPhone: await question('Enter recommender phone number: '),
    recommenderTitle: await question('Enter recommender job title: '),
    company: await question('Enter company name: '),
  }

  console.log('\nGenerating documents...')

  // Generate PDF
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  const html = generateHTML(data)
  await page.setContent(html, { waitUntil: 'networkidle0' })

  const pdfFileName = `${data.recommendedName.toLowerCase().replace(/\s+/g, '-')}-recommendation.pdf`
  await page.pdf({
    path: pdfFileName,
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

  // Generate DOCX
  await generateDOCX(data)

  console.log(`\n✅ Documents generated successfully!`)
  console.log(`📄 PDF: ${pdfFileName}`)
  console.log(
    `📝 DOCX: ${data.recommendedName.toLowerCase().replace(/\s+/g, '-')}-recommendation.docx`,
  )

  rl.close()
})()
