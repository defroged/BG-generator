const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const formidable = require('formidable');
const path = require('path');

async function loadJSONData() {
  const data = await fs.readFile(path.join(__dirname, '..', 'snakesMapping.json'), 'utf8');
  return JSON.parse(data);
}

module.exports = async (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error parsing form data.');
      return;
    }

    try {
      const pdfBoxMappings = await loadJSONData();
      const pdfBytes = await fs.readFile(path.join(__dirname, '..', 'assets', 'snakesAndLaddersTemplate.pdf'));
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPage(0);

      // Example of adding text using the parsed fields
      pdfBoxMappings.forEach(mapping => {
  const content = fields[mapping.id]; // Access the form data for each box id
  if (content && typeof content === 'string') {
    page.drawText(content, {
      x: mapping.x,
      y: mapping.y,
      size: mapping.font.size,
      // Load or select a font here. Example:
      // font: await pdfDoc.embedFont(StandardFonts.Helvetica),
    });
  }
});

      const modifiedPdfBytes = await pdfDoc.save();
      res.setHeader("Content-Type", "application/pdf");
      res.send(modifiedPdfBytes);
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred during PDF processing.');
    }
  });
};
