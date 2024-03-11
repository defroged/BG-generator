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

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  const boxKeys = Object.keys(fields).filter(key => key.startsWith('box'));

  const positions = [
    { x: 140, y: 20 },
    { x: 210, y: 20 },
    { x: 280, y: 20 },
    { x: 350, y: 20 },
    { x: 420, y: 20 },
    { x: 490, y: 20 },
    { x: 560, y: 20 },
    { x: 630, y: 20 },
    { x: 700, y: 20 },
    { x: 70, y: 90 },
    { x: 140, y: 90 },
    { x: 210, y: 90 },
    { x: 280, y: 90 },
    { x: 350, y: 90 },
    { x: 420, y: 90 },
    { x: 490, y: 90 },
    { x: 560, y: 90 },
    { x: 630, y: 90 },
  ];

  boxKeys.forEach((boxKey, index) => {
    const inputTextArray = fields[boxKey];
    const inputText = Array.isArray(inputTextArray) && inputTextArray.length > 0 ? inputTextArray[0] : '';
    const position = positions[index];
    const maxWidth = 70;
    const maxHeight = 60;
    const { fontSize, lines } = fitTextToBox(inputText, helveticaFont, 16, maxWidth, maxHeight);
    const lineSpacing = 1.2;
    const lineHeight = helveticaFont.heightAtSize(fontSize);

    let startY;
    if (lines.length === 1) {
      // Center the text vertically for single-line text
      startY = position.y + (maxHeight - lineHeight) / 2;
    } else {
      // Start from the top for multi-line text
      startY = position.y + maxHeight - lineHeight;
    }

    lines.forEach((line, i) => {
      const lineWidth = helveticaFont.widthOfTextAtSize(line, fontSize);
      const lineX = position.x + (maxWidth - lineWidth) / 2;
      // Adjust Y position for each subsequent line
      const lineY = startY - i * lineHeight * lineSpacing;

      firstPage.drawText(line, {
        x: lineX,
        y: lineY,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0.95, 0.1, 0.1),
      });
    });
  });
}

module.exports = {
  addTextToPdf
};