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
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carta de Recomendación</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: white;
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
        <h1>Referencia Personal</h1>
    </div>
    
    <div class="date">
        <p>${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    
    <div class="recipient">
        <p>A quien corresponda:</p>
    </div>
    
    <div class="salutation">
        <p>Estimado/a Responsable de Contratación,</p>
    </div>
    
    <div class="content">
        <p>Es con gran placer que escribo esta carta de recomendación para ${data.recommendedName}. He tenido el privilegio de trabajar con ${data.recommendedName} durante mi tiempo como ${data.recommenderTitle} en ${data.company}, y puedo decir con confianza que es una de las personas más excepcionales que he encontrado en mi carrera profesional.</p>
        
        <p>Durante nuestro tiempo trabajando juntos, ${data.recommendedName} demostró cualidades profesionales sobresalientes, incluyendo una fuerte ética de trabajo, excelentes habilidades de resolución de problemas y la capacidad de trabajar eficazmente tanto de forma independiente como como parte de un equipo. Su dedicación a la excelencia y su atención al detalle consistently me impresionaron a mí y a sus colegas.</p>
        
        <p>${data.recommendedName} posee habilidades interpersonales notables y la capacidad de comunicarse eficazmente con personas de todos los niveles. Su actitud positiva y su disposición a superar las expectativas lo convierten en un activo invaluable para cualquier organización.</p>
        
        <p>Recomiendo encarecidamente a ${data.recommendedName} sin ninguna reserva. Estoy seguro de que será una excelente adición a su equipo y contribuirá significativamente al éxito de su organización.</p>
        
        <p>No dude en contactarme si requiere alguna información adicional.</p>
    </div>
    
    <div class="closing">
        <p>Atentamente,</p>
        <div class="signature">
            <p>${data.recommenderName}</p>
            <p>${data.recommenderTitle}</p>
            <p>${data.company}</p>
            <div class="contact-info">
                <p>Teléfono: ${data.recommenderPhone}</p>
                <p>LinkedIn: ${data.recommenderLink}</p>
                <p>Cédula: ${data.recommendedIdCard}</p>
            </div>
        </div>
    </div>
</body>
</html>`
}

const generateDOCX = async (data) => {
  const { Document, Packer, Paragraph, TextRun } = require('docx')

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
                text: new Date().toLocaleDateString('es-ES', {
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
                text: 'A quien corresponda:',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Estimado/a Responsable de Contratación,',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Es con gran placer que escribo esta carta de recomendación para ${data.recommendedName}. He tenido el privilegio de trabajar con ${data.recommendedName} durante mi tiempo como ${data.recommenderTitle} en ${data.company}, y puedo decir con confianza que es una de las personas más excepcionales que he encontrado en mi carrera profesional.`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Durante nuestro tiempo trabajando juntos, ${data.recommendedName} demostró cualidades profesionales sobresalientes, incluyendo una fuerte ética de trabajo, excelentes habilidades de resolución de problemas y la capacidad de trabajar eficazmente tanto de forma independiente como como parte de un equipo. Su dedicación a la excelencia y su atención al detalle consistentemente me impresionaron a mí y a sus colegas.`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${data.recommendedName} posee habilidades interpersonales notables y la capacidad de comunicarse eficazmente con personas de todos los niveles. Su actitud positiva y su disposición a superar las expectativas lo convierten en un activo invaluable para cualquier organización.`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Recomiendo encarecidamente a ${data.recommendedName} sin ninguna reserva. Estoy seguro de que será una excelente adición a su equipo y contribuirá significativamente al éxito de su organización.`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'No dude en contactarme si requiere alguna información adicional.',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Atentamente,',
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
                text: `Teléfono: ${data.recommenderPhone}`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `LinkedIn: ${data.recommenderLink}`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Cédula: ${data.recommendedIdCard}`,
              }),
            ],
          }),
        ],
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(
    `${data.recommendedName.toLowerCase().replace(/\s+/g, '-')}-recomendacion.docx`,
    buffer,
  )
}

;(async () => {
  console.log('=== Generador de Carta de Recomendación (Español) ===\n')

  const data = {
    recommenderName: await question('Ingrese el nombre del recomendante: '),
    recommendedName: await question(
      'Ingrese el nombre de la persona recomendada: ',
    ),
    recommenderPhone: await question(
      'Ingrese el número de teléfono del recomendante: ',
    ),
    recommenderLink: await question(
      'Ingrese el enlace LinkedIn/página web del recomendante: ',
    ),
    recommenderTitle: await question('Ingrese el cargo del recomendante: '),
    company: await question('Ingrese el nombre de la empresa: '),
    recommendedIdCard: await question('Ingrese el número de cédula de la persona recomendada: ')
  }

  console.log('\nGenerando documentos...')

  // Generate PDF
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  const html = generateHTML(data)
  await page.setContent(html, { waitUntil: 'networkidle0' })

  const pdfFileName = `${data.recommendedName.toLowerCase().replace(/\s+/g, '-')}-recomendacion.pdf`
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

  console.log(`\n✅ ¡Documentos generados exitosamente!`)
  console.log(`📄 PDF: ${pdfFileName}`)
  console.log(
    `📝 DOCX: ${data.recommendedName.toLowerCase().replace(/\s+/g, '-')}-recomendacion.docx`,
  )

  rl.close()
})()
