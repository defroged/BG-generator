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

      pdfBoxMappings.forEach(mapping => {
        const content = fields[mapping.id]; 
        if (content && typeof content === 'string') {
          page.drawText(content, {
            x: mapping.x,
            y: mapping.y,
            size: mapping.font.size,
          });
        }
      });

      const modifiedPdfBytes = await pdfDoc.save();

      const randomKey = Date.now();
      const outputPath = path.join(__dirname, '..', 'assets', 'generated_pdfs', `${randomKey}.pdf`);
      await fs.writeFile(outputPath, modifiedPdfBytes);

      const downloadUrl = `https://${process.env.DOMAIN}/assets/generated_pdfs/${randomKey}.pdf`;
      res.status(200).json({ downloadUrl });

    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred during PDF processing.');
    }
  }); // form.parse closing
}; // module.exports closing