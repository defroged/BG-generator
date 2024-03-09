const fontkit = require('@pdf-lib/fontkit');
const { rgb, StandardFonts } = require('pdf-lib');

async function addTextToPdf(pdfDoc, fields) {
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages()
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  // Get all input fields starting with "box"
  const boxKeys = Object.keys(fields).filter(key => key.startsWith('box'));

  // Define an array of positions for each input field (x, y)
  const positions = [
    { x: 160, y: 20 },
    { x: 230, y: 20 },
    { x: 300, y: 20 },
    { x: 370, y: 20 },
    { x: 440, y: 20 },
    { x: 510, y: 20 },
    { x: 580, y: 20 },
    { x: 650, y: 20 },
    { x: 720, y: 20 },
	{ x: 90, y: 90 },
    { x: 160, y: 90 },
    { x: 230, y: 90 },
    { x: 300, y: 90 },
    { x: 370, y: 90 },
    { x: 440, y: 90 },
    { x: 510, y: 90 },
    { x: 580, y: 90 },
    { x: 650, y: 90 },
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