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

  const userInputTexts = boxKeys.map((boxKey) => {
    const inputTextArray = fields[boxKey];
    return Array.isArray(inputTextArray) && inputTextArray.length > 0 ? inputTextArray[0] : '';
  });

  const fillTexts = [];
  for (let i = 0; i < 98; i++) {
    fillTexts[i] = userInputTexts[i % userInputTexts.length];
  }

  const positions = [
    { x: 140, y: 5 }, // 1
    { x: 210, y: 5 }, // 2
    { x: 280, y: 5 }, // 3
    { x: 350, y: 5 }, // 4
    { x: 420, y: 5 }, // 5
    { x: 495, y: 5 }, // 6
    { x: 565, y: 5 }, // 7
    { x: 640, y: 5 }, // 8
    { x: 710, y: 5 }, // 9
    { x: 70, y: 60 }, // 10
    { x: 140, y: 60 }, // 11
    { x: 210, y: 60 }, // 12
    { x: 280, y: 60 }, // 13
    { x: 350, y: 60 }, // 14
    { x: 425, y: 60 }, // 15
    { x: 495, y: 60 }, // 16
    { x: 565, y: 60 }, // 17
    { x: 640, y: 60 }, // 18
    { x: 710, y: 60 }, // 19
    { x: 70, y: 120 }, // 20
    { x: 140, y: 120 }, // 21
    { x: 210, y: 120 }, // 22
    { x: 280, y: 120 }, // 23
    { x: 350, y: 120 }, // 24
    { x: 425, y: 120 }, // 25
    { x: 495, y: 120 }, // 26
    { x: 565, y: 120 }, // 27
    { x: 640, y: 120 }, // 28
    { x: 710, y: 120 }, // 29
    { x: 70, y: 180 }, // 30
    { x: 140, y: 180 }, // 31
    { x: 210, y: 180 }, // 32
    { x: 280, y: 180 }, // 33
    { x: 350, y: 180 }, // 34
    { x: 425, y: 180 }, // 35
    { x: 495, y: 180 }, // 36
    { x: 565, y: 180 }, // 37
    { x: 640, y: 180 }, // 38
    { x: 710, y: 180 }, // 39
    { x: 70, y: 240 }, // 40
    { x: 140, y: 240 }, // 41
    { x: 210, y: 240 }, // 42
    { x: 280, y: 240 }, // 43
    { x: 350, y: 240 }, // 44
    { x: 425, y: 240 }, // 45
    { x: 495, y: 240 }, // 46
    { x: 565, y: 240 }, // 47
    { x: 640, y: 240 }, // 48
    { x: 710, y: 240 }, // 49
    { x: 70, y: 297 }, // 50
    { x: 140, y: 297 }, // 51
    { x: 210, y: 297 }, // 52
    { x: 280, y: 297 }, // 53
    { x: 350, y: 297 }, // 54
    { x: 425, y: 297 }, // 55
    { x: 495, y: 297 }, // 56
    { x: 565, y: 297 }, // 57
    { x: 640, y: 297 }, // 58
    { x: 710, y: 297 }, // 59
    { x: 70, y: 357 }, // 60
	{ x: 140, y: 357 }, // 61
	{ x: 210, y: 357 }, // 62
	{ x: 280, y: 357 }, // 63
	{ x: 350, y: 357 }, // 64
	{ x: 425, y: 357 }, // 65
	{ x: 495, y: 357 }, // 66
	{ x: 565, y: 357 }, // 67
	{ x: 640, y: 357 }, // 68
	{ x: 710, y: 357 }, // 69
	{ x: 70, y: 417 }, // 70
	{ x: 140, y: 417 }, // 71
	{ x: 210, y: 417 }, // 72
	{ x: 280, y: 417 }, // 73
	{ x: 350, y: 417 }, // 74
	{ x: 425, y: 417 }, // 75
	{ x: 495, y: 417 }, // 76
	{ x: 565, y: 417 }, // 77
	{ x: 640, y: 417 }, // 78
	{ x: 710, y: 417 }, // 79
	{ x: 70, y: 477 }, // 80
	{ x: 140, y: 477 }, // 81
	{ x: 210, y: 477 }, // 82
	{ x: 280, y: 477 }, // 83
	{ x: 350, y: 477 }, // 84
	{ x: 425, y: 477 }, // 85
	{ x: 495, y: 477 }, // 86
	{ x: 565, y: 477 }, // 87
	{ x: 640, y: 477 }, // 88
	{ x: 710, y: 477 }, // 89
	{ x: 140, y: 537 }, // 90
	{ x: 210, y: 537 }, // 91
	{ x: 280, y: 537 }, // 92
	{ x: 350, y: 537 }, // 93
	{ x: 425, y: 537 }, // 94
	{ x: 495, y: 537 }, // 95
	{ x: 565, y: 537 }, // 96
	{ x: 640, y: 537 }, // 97
	{ x: 710, y: 537 }, // 98
  ];

   const boxIndices = Array.from({ length: 98 }, (_, i) => i);
  const shuffledIndices = boxIndices.sort(() => 0.5 - Math.random());

  const strokeOffset = 0.8;
  const strokeOpacity = 0.5;

  shuffledIndices.forEach((randomIndex, index) => {
    const inputText = fillTexts[index];
    const position = positions[randomIndex];
    const maxWidth = 70;
    const maxHeight = 60;
    const { fontSize, lines } = fitTextToBox(inputText, helveticaFont, 16, maxWidth, maxHeight);
    const lineSpacing = 1.2;
    const lineHeight = helveticaFont.heightAtSize(fontSize);

    
function calculateYOffset(linesCount) {
  if (linesCount <= 4) {
    return 17;
  } else {
    return 17 + (linesCount - 4) * 7;
  }
}

let startY;
if (lines.length === 1) {
  startY = position.y + (maxHeight - lineHeight) / 2;
} else {
  const totalTextHeight = lineHeight * lines.length + (lineSpacing * (lines.length - 1) * lineHeight);
  const yOffset = calculateYOffset(lines.length);
  startY = position.y + (maxHeight + totalTextHeight) / 2 - yOffset - lineHeight;
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
      firstPage.drawText(line, {
        x: lineX,
        y: lineY,
        size: fontSize,
        font: helveticaFont,
        color: rgb(30, 30, 30),
      });
    });
  });
}

module.exports = {
  addTextToPdf
};