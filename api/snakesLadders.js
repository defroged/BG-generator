/* load the PDF/box mapping */
const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises; // Using fs.promises for async operations

async function loadJSONData() {
  const data = await fs.readFile('snakesMapping.json', 'utf8');
  return JSON.parse(data);
}

module.exports = async (req, res) => {
  try {
    const pdfBoxMappings = await loadJSONData();
    const pdfBytes = await fs.readFile('assets/snakesAndLaddersTemplate.pdf');

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPage(0);

    // Example: Loop through mappings and add text or images
    // This is a placeholder - you'll replace this with actual logic based on user input
    pdfBoxMappings.forEach(mapping => {
      page.drawText("Placeholder", {
        x: mapping.x,
        y: mapping.y,
        size: mapping.font.size,
        font: /* You'll need to load or select a font here */,
      });
    });

    const modifiedPdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.send(modifiedPdfBytes);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred.');
  }
};
