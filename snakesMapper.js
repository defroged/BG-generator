const { rgb, StandardFonts } = require('pdf-lib');

async function addTextToPdf(pdfDoc, fields) {
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  const positions = [
    { x: 160, y: 20 },
    { x: 250, y: 20 },
    { x: 160, y: 40 },
    { x: 250, y: 40 },
    // Add more custom positions if necessary
  ];

  boxKeys.forEach((boxKey, index) => {
    const inputTextArray = fields[boxKey];
    const inputText = Array.isArray(inputTextArray) && inputTextArray.length > 0 ? inputTextArray[0] : '';

    // Get the corresponding position from the positions array
    const position = positions[index];

    firstPage.drawText(inputText, {
      x: position.x,
      y: position.y,
      size: 16,
      font: helveticaFont,
      color: rgb(0.95, 0.1, 0.1),
    });
  });
}

module.exports = {
  addTextToPdf
};