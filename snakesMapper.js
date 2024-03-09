const { rgb, StandardFonts } = require('pdf-lib');

async function addTextToPdf(pdfDoc, fields) {
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  const boxKeys = Object
    .keys(fields)
    .filter(key => key.startsWith('box'))
    .sort((a, b) => Number(a.slice(3)) - Number(b.slice(3)));

  const boxRows = 10;
  const boxCols = 9;
  const startX = 150; // The x-coordinate of the top-left box (change it accordingly)
  const startY = 700; // The y-coordinate of the top-left box (change it accordingly)
  const boxWidth = 75; // The width of a single box, including spacing between boxes (change it accordingly)
  const boxHeight = 60; // The height of a single box, including spacing between boxes (change it accordingly)

  const boxCoords = [];
  for (let row = 0; row < boxRows; row++) {
    for (let col = 0; col < boxCols; col++) {
      const x = startX + col * boxWidth;
      const y = startY - row * boxHeight;
      boxCoords.push(x, y);
    }
  }

  for (let i = 0; i < boxKeys.length; i++) {
    const key = boxKeys[i];
    const textArray = fields[key];
const text = Array.isArray(textArray) && textArray.length > 0 ? textArray[0] : '';

    firstPage.drawText(text, {
      x: boxCoords[i * 2],       // e.g., x1 for i=0; x2 for i=1, ...
      y: boxCoords[i * 2 + 1],   // e.g., y1 for i=0; y2 for i=1, ...
      size: 16,
      font: helveticaFont,
      color: rgb(0.95, 0.1, 0.1),
    });
  }
}

module.exports = {
  addTextToPdf
};