const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun, PageOrientation } = require('docx');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const htmlFile = 'DiagramaTuberiasPVC.html';
  const pdfFile = 'diagrama-tuberias-pvc.pdf';
  const docxFile = 'diagrama-tuberias-pvc.docx';

  const htmlPath = path.join(__dirname, htmlFile);
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Load the page
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Wait for mermaid to render
  await page.waitForSelector('.mermaid svg');

  // GENERATE PDF
  await page.pdf({
    path: pdfFile,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: {
      top: '10mm',
      right: '10mm',
      bottom: '10mm',
      left: '10mm',
    },
  });
  console.log(`Generated ${pdfFile}`);

  // GENERATE DOCX
  // Extract texts
  const data = await page.evaluate(() => {
    return {
      title: document.querySelector('h1') ? document.querySelector('h1').innerText : 'Diagrama',
      subtitle: document.querySelector('.subtitle') ? document.querySelector('.subtitle').innerText : '',
      diagramTitle: document.querySelectorAll('.section-title')[0] ? document.querySelectorAll('.section-title')[0].innerText : '',
      cardsTitle: document.querySelectorAll('.section-title')[1] ? document.querySelectorAll('.section-title')[1].innerText : '',
      cards: Array.from(document.querySelectorAll('.five-m-card')).map(card => {
        return {
          title: card.querySelector('.m-title') ? card.querySelector('.m-title').innerText : '',
          content: card.querySelector('.m-content') ? card.querySelector('.m-content').innerText : ''
        };
      })
    };
  });

  // Capture diagram image
  const diagramElement = await page.$('.mermaid');
  const diagramBuffer = await diagramElement.screenshot();

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
            },
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000,
            },
          },
        },
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: data.title, bold: true, size: 32 }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: data.subtitle, italics: true, size: 24 }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }), // spacing
          new Paragraph({
            children: [
              new TextRun({ text: data.diagramTitle, bold: true, size: 28 }),
            ],
          }),
          new Paragraph({ text: "" }), // spacing
          new Paragraph({
            children: [
              new ImageRun({
                data: diagramBuffer,
                transformation: {
                  width: 700,
                  height: 350,
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }), // spacing
          new Paragraph({
            children: [
              new TextRun({ text: data.cardsTitle, bold: true, size: 28 }),
            ],
          }),
          ...data.cards.map(card => {
             return [
               new Paragraph({
                 children: [new TextRun({ text: card.title, bold: true, size: 24 })]
               }),
               new Paragraph({
                 children: [new TextRun({ text: card.content, size: 22 })]
               }),
               new Paragraph({ text: "" }),
             ];
          }).flat(),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxFile, buffer);
  
  console.log(`Generated ${docxFile}`);

  await browser.close();
})();
