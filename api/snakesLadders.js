const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const formidable = require('formidable');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const decodedCredentials = JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString('utf8'));
const fontkit = require('fontkit');

const dpi = 72;
function pixelsToPoints(value) {
  return value * 72 / dpi;
}

const storage = new Storage({
  projectId: decodedCredentials.project_id,
  credentials: decodedCredentials,
});
const bucketName = 'bg_pdf_bucket';
const bucket = storage.bucket(bucketName);

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
console.log('Received Fields:', fields);
    try {
      const fontBytes = await fs.readFile(path.join(__dirname, '..', 'assets', 'Arial.ttf'));

      const pdfBoxMappings = await loadJSONData();
      console.log('pdfBoxMappings:', pdfBoxMappings);

      const pdfBytes = await fs.readFile(path.join(process.cwd(), 'public', 'assets', 'snakesAndLaddersTemplate.pdf'));
      const pdfDoc = await PDFDocument.load(pdfBytes);
      pdfDoc.registerFontkit(fontkit); 
      const page = pdfDoc.getPage(0);
      const customFont = await pdfDoc.embedFont(fontBytes);

      console.log('Form fields:', fields);
      pdfBoxMappings.forEach(mapping => {
  const content = fields[mapping.id];
  if (content && typeof content === 'string') {
    const x = pixelsToPoints(mapping.x);
    const y = pixelsToPoints(mapping.y);
    const width = pixelsToPoints(mapping.width);
    const height = pixelsToPoints(mapping.height);

    const textWidth = customFont.widthOfTextAtSize(content, mapping.font.size);
    const textHeight = customFont.heightAtSize(mapping.font.size);

    const newX = x + (width / 2) - (textWidth / 2);
    const newY = y + (height / 2) - (textHeight / 2);

    page.drawText(content, {
      x: newX,
      y: newY,
      size: mapping.font.size,
      font: customFont,
    });
  }
});

      const modifiedPdfBytes = await pdfDoc.save();
      console.log('modifiedPdfBytes:', modifiedPdfBytes);

      const randomKey = Date.now().toString();
      const fileName = `${randomKey}.pdf`;
      console.log('fileName:', fileName);
      const remoteFile = bucket.file(fileName);
      console.log('remoteFile:', remoteFile);
      await remoteFile.save(Buffer.from(modifiedPdfBytes), { contentType: 'application/pdf' });

      const signedUrlConfig = {
        action: 'read',
        expires: Date.now() + 12 * 60 * 60 * 1000, 
        contentDisposition: 'attachment; filename=customized_board_game.pdf',
      };

      const downloadUrl = await remoteFile.getSignedUrl(signedUrlConfig);

      res.status(200).json({ downloadUrl: downloadUrl[0] });

    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred during PDF processing.');
    }
  }); 
};