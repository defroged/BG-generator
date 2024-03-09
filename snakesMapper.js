const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');

// A function to wrap text to fit within a certain width
function wrapText(font, text, maxWidth, fontSize) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = font.widthOfTextAtSize(`${currentLine} ${word}`, fontSize);
    if (width < maxWidth) {
      currentLine += ` ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine); // Add the last line
  return lines;
}

async function addTextToPdf(pdfBytes, fields) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.registerFontkit(fontkit);

  // Use the URL to your font or replace with a path to a font file if running locally
  const fontBytes = await fetch('https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf')
    .then((res) => res.arrayBuffer());
  const customFont = await pdfDoc.embedFont(fontBytes);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const boxWidth = 70; // Define the width of the boxes
  const fontSize = 16; // Starting font size

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

  Object.keys(fields).filter(key => key.startsWith('box')).forEach((boxKey, index) => {
    const inputText = fields[boxKey];
    const position = positions[index];
    const lines = wrapText(customFont, inputText, boxWidth, fontSize);

    lines.forEach((line, lineIndex) => {
      firstPage.drawText(line, {
        x: position.x,
        y: position.y - (lineIndex * (fontSize + 5)), // Adjust Y based on the line index
        size: fontSize,
        font: customFont,
        color: rgb(0.95, 0.1, 0.1),
      });
    });
  });

  return pdfDoc.save();
}

// Export the function so it can be used in other files
module.exports = {
  addTextToPdf
};