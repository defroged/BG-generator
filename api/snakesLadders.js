const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const formidable = require('formidable');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const decodedCredentials = JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString('utf8'));

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
	     console.log('modifiedPdfBytes:', modifiedPdfBytes);

      const randomKey = Date.now().toString();
      const fileName = `${randomKey}.pdf`;
	     console.log('fileName:', fileName);
const remoteFile = bucket.file(fileName);
   console.log('remoteFile:', remoteFile);
await remoteFile.save(modifiedPdfBytes, { contentType: 'application/pdf' });

const signedUrlConfig = {
  action: 'read',
  expiresIn: '12h',
  promptSaveAs: 'customized_board_game.pdf',
};
const downloadUrl = await remoteFile.getSignedUrl(signedUrlConfig);

res.status(200).json({ downloadUrl: downloadUrl[0] });

    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred during PDF processing.');
    }
  }); 
}; 