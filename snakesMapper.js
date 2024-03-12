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
    { x: 430, y: 0 },
    { x: 500, y: 0 },
    { x: 570, y: 0 },
    { x: 640, y: 0 },
    { x: 710, y: 0 },
    { x: 70, y: 60 },
    { x: 140, y: 60 },
    { x: 210, y: 60 },
    { x: 280, y: 60 },
    { x: 350, y: 60 },
    { x: 430, y: 60 },
    { x: 500, y: 60 },
    { x: 570, y: 60 },
    { x: 640, y: 60 },
	{ x: 710, y: 60 },
	{ x: 70, y: 120 },
    { x: 140, y: 120 },
    { x: 210, y: 120 },
    { x: 280, y: 120 },
    { x: 350, y: 120 },
    { x: 430, y: 120 },
    { x: 500, y: 120 },
    { x: 570, y: 120 },
    { x: 640, y: 120 },
	{ x: 710, y: 120 },
	{ x: 70, y: 180 },
{ x: 140, y: 180 },
{ x: 210, y: 180 },
{ x: 280, y: 180 },
{ x: 350, y: 180 },
{ x: 430, y: 180 },
{ x: 500, y: 180 },
{ x: 570, y: 180 },
{ x: 640, y: 180 },
{ x: 710, y: 180 },
{ x: 70, y: 240 },
{ x: 140, y: 240 },
{ x: 210, y: 240 },
{ x: 280, y: 240 },
{ x: 350, y: 240 },
{ x: 430, y: 240 },
{ x: 500, y: 240 },
{ x: 570, y: 240 },
{ x: 640, y: 240 },
{ x: 710, y: 240 },
{ x: 70, y: 300 },
{ x: 140, y: 300 },
{ x: 210, y: 300 },
{ x: 280, y: 300 },
{ x: 350, y: 300 },
{ x: 430, y: 300 },
{ x: 500, y: 300 },
{ x: 570, y: 300 },
{ x: 640, y: 300 },
{ x: 710, y: 300 },
{ x: 70, y: 360 },
{ x: 140, y: 360 },
{ x: 210, y: 360 },
{ x: 280, y: 360 },
{ x: 350, y: 360 },
{ x: 430, y: 360 },
{ x: 500, y: 360 },
{ x: 570, y: 360 },
{ x: 640, y: 360 },
{ x: 710, y: 360 },
{ x: 70, y: 420 },
{ x: 140, y: 420 },
{ x: 210, y: 420 },
{ x: 280, y: 420 },
{ x: 350, y: 420 },
{ x: 430, y: 420 },
{ x: 500, y: 420 },
{ x: 570, y: 420 },
{ x: 640, y: 420 },
{ x: 710, y: 420 },
{ x: 70, y: 480 },
{ x: 140, y: 480 },
{ x: 210, y: 480 },
{ x: 280, y: 480 },
{ x: 350, y: 480 },
{ x: 430, y: 480 },
{ x: 500, y: 480 },
{ x: 570, y: 480 },
{ x: 640, y: 480 },
{ x: 710, y: 480 },

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

    const longestLineIndex = lines.reduce((maxIndex, currentLine, currentIndex, array) => {
  return helveticaFont.widthOfTextAtSize(currentLine, fontSize) > helveticaFont.widthOfTextAtSize(array[maxIndex], fontSize)
      ? currentIndex
      : maxIndex;
}, 0);

const longestLineWidth = helveticaFont.widthOfTextAtSize(lines[longestLineIndex], fontSize);
const lineX = position.x + (maxWidth - longestLineWidth) / 2;

lines.forEach((line, i) => {
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