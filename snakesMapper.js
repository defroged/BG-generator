const { rgb, StandardFonts } = require('pdf-lib');

async function addTextToPdf(pdfDoc, fields) {
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages()
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  const textArray = fields['box1'];
  const text = Array.isArray(textArray) && textArray.length > 0 ? textArray[0] : '';

  firstPage.drawText(text, {
    x: 55,
    y: height - 110,
    size: 16,
    font: helveticaFont,
    color: rgb(0.95, 0.1, 0.1),
  });
}

module.exports = {
  addTextToPdf
};