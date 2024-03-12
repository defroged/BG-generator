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
    { x: 140, y: 0 },
    { x: 210, y: 0 },
    { x: 280, y: 0 },
    { x: 350, y: 0 },
    { x: 420, y: 0 },
    { x: 490, y: 0 },
    { x: 560, y: 0 },
    { x: 630, y: 0 },
    { x: 700, y: 0 },
    { x: 70, y: 70 },
    { x: 140, y: 70 },
    { x: 210, y: 70 },
    { x: 280, y: 70 },
    { x: 350, y: 70 },
    { x: 420, y: 70 },
    { x: 490, y: 70 },
    { x: 560, y: 70 },
    { x: 630, y: 70 },
  ];
// Stroke settings
  const strokeOffsets = [1, -1]; // Adjust the offset for the stroke effect
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
      strokeOffsets.forEach(offsetX => {
        strokeOffsets.forEach(offsetY => {
          // Creating a denser pattern around the text for a thicker stroke
          for (let dx = offsetX; dx <= Math.abs(offsetX); dx += 0.5) {
            for (let dy = offsetY; dy <= Math.abs(offsetY); dy += 0.5) {
              firstPage.drawText(line, {
                x: lineX + dx,
                y: lineY + dy,
                size: fontSize,
                font: helveticaFont,
                color: rgb(1, 1, 1, strokeOpacity),  // Semi-transparent white
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