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
  { x: 150, y: 0 },
  { x: 220, y: 0 },
  { x: 290, y: 0 },
  { x: 360, y: 0 },
  { x: 430, y: 0 },
  { x: 500, y: 0 },
  { x: 570, y: 0 },
  { x: 640, y: 0 },
  { x: 710, y: 0 },
  { x: 80, y: 60 },
  { x: 150, y: 60 },
  { x: 220, y: 60 },
  { x: 290, y: 60 },
  { x: 360, y: 60 },
  { x: 430, y: 60 },
  { x: 500, y: 60 },
  { x: 570, y: 60 },
  { x: 640, y: 60 },
];
// Stroke settings
  const strokeOffset = 0.8; // Adjust the offset for the stroke effect
  const strokeOpacity = 0.5; // Adjust the opacity for the stroke

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
      startY = position.y + (maxHeight - lineHeight) / 2;
    } else {
      startY = position.y + maxHeight - lineHeight;
    }

    lines.forEach((line, i) => {
      const lineWidth = helveticaFont.widthOfTextAtSize(line, fontSize);
      const lineX = position.x + (maxWidth - lineWidth) / 2;
      const lineY = startY - i * lineHeight * lineSpacing;

      // Draw the stroke by rendering the text multiple times with an offset
      const offsets = [-strokeOffset, strokeOffset];
      offsets.forEach(dx => {
        offsets.forEach(dy => {
          firstPage.drawText(line, {
            x: lineX + dx,
            y: lineY + dy,
            size: fontSize,
            font: helveticaFont,
            color: rgb(1, 1, 1, strokeOpacity), // Semi-transparent white
          });
        });
      });

      // Draw the main text on top
      firstPage.drawText(line, {
        x: lineX,
        y: lineY,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0.25, 0.25, 0.25),
      });
    });
  });
}

module.exports = {
  addTextToPdf
};