const { rgb, StandardFonts } = require('pdf-lib');

async function addTextToPdf(pdfDoc, fields) {
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages()
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  // Get all input fields starting with "box"
  const boxKeys = Object.keys(fields).filter(key => key.startsWith('box'));

  // Calculate x and y positions
  const startY = 20;
  const lineHeight = 20;
  const offsetX = 160;

  boxKeys.forEach((boxKey, index) => {
    const inputText = fields[boxKey];

    firstPage.drawText(inputText, {
      x: offsetX,
      y: startY + index * lineHeight,
      size: 16,
      font: helveticaFont,
      color: rgb(0.95, 0.1, 0.1),
    });
  });
}

module.exports = {
  addTextToPdf
};