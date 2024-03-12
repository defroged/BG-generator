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
    { x: 70, y: 60 },
    { x: 140, y: 60 },
    { x: 210, y: 60 },
    { x: 280, y: 60 },
    { x: 350, y: 60 },
    { x: 420, y: 60 },
    { x: 490, y: 60 },
    { x: 560, y: 60 },
    { x: 630, y: 60 },
  ];
// Stroke settings
  const strokeOffset = 0.8; 
  const strokeOpacity = 0.5; 

  boxKeys.forEach((boxKey, index) => {
    const inputTextArray = fields[boxKey];
    const inputText = Array.isArray(inputTextArray) && inputTextArray.length > 0 ? inputTextArray[0] : '';
    const position = positions[index];
    const maxWidth = 70;  // Maximum width of text box, adjust if needed
    const maxHeight = 60; // Maximum height of text box, adjust if needed

    // Fit the text to the box using the fitTextToBox function
    const { fontSize, lines } = fitTextToBox(inputText, helveticaFont, 16, maxWidth, maxHeight);
    const lineSpacing = 1.2;
    const lineHeight = helveticaFont.heightAtSize(fontSize) + helveticaFont.descentAtSize(fontSize);

    let startY;
    if (lines.length === 1) {
      // Center single line of text vertically
      startY = position.y + (maxHeight - lineHeight) / 2;
    } else {
      // Align the first line of text to the top of the box
      startY = position.y + maxHeight - lineHeight;
    }

    // Draw each line of text
    lines.forEach((line, i) => {
      const lineWidth = helveticaFont.widthOfTextAtSize(line, fontSize);
      const lineX = position.x + (maxWidth - lineWidth) / 2; // Center text horizontally
      const lineY = startY - i * lineHeight * lineSpacing; // Position text vertically

      // Draw text outlines for stroke effect
      const offsets = [-strokeOffset, strokeOffset];
      offsets.forEach(dx => {
        offsets.forEach(dy => {
          firstPage.drawText(line, {
            x: lineX + dx,
            y: lineY + dy,
            size: fontSize,
            font: helveticaFont,
            color: rgb(1, 1, 1, strokeOpacity),
          });
        });
      });

      // Draw the actual text
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