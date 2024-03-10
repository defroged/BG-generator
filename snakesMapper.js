const fontkit = require('@pdf-lib/fontkit');
const { rgb, StandardFonts } = require('pdf-lib');

function fitTextToBox(text, font, defaultFontSize, maxWidth, maxHeight) {
  let lines = [];
  let fontSize = defaultFontSize;
  let words, currentLineWords, currentLineWidth, potentialLineWidth;

  while (fontSize > 1) {
    lines = [];
    words = text.split(' ');

    while (words.length > 0) {
      currentLineWords = [];
      currentLineWidth = 0;

      while (words.length > 0) {
        potentialLineWidth = font.widthOfTextAtSize(currentLineWords.concat(words[0]).join(' '), fontSize);

        if (potentialLineWidth <= maxWidth) {
          currentLineWords.push(words.shift());
          currentLineWidth = potentialLineWidth;
        } else {
          break;
        }
      }

      lines.push(currentLineWords.join(' '));

      if ((lines.length + 1) * font.heightAtSize(fontSize) > maxHeight) {
        break;
      }
    }

    if (words.length === 0) {
      return { fontSize, lines };
    }

    fontSize--;
  }

  return { fontSize, lines: [text] };
}

async function addTextToPdf(pdfDoc, fields) {
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages()
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  const boxKeys = Object.keys(fields).filter(key => key.startsWith('box'));

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
    const position = positions[index];

    // Set maxWidth and maxHeight for a 70x70 point box
const maxWidth = 70;
const maxHeight = 70;

const { fontSize, lines } = fitTextToBox(inputText, helveticaFont, 16, maxWidth, maxHeight);
const lineSpacing = 1.2;
const lineHeight = helveticaFont.heightAtSize(fontSize);

let lineY = position.y;

lines.forEach((line) => {
  firstPage.drawText(line, {
    x: position.x,
    y: lineY,
    size: fontSize,
    font: helveticaFont,
    color: rgb(0.95, 0.1, 0.1),
  });
  lineY -= lineHeight * lineSpacing;
});
  });
}

module.exports = {
  addTextToPdf
};