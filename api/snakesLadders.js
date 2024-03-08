const { addTextToPdf } = require('./pdfTextMapper');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
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
      const pdfBytes = await fs.readFile(path.join(process.cwd(), 'assets', 'snakesAndLaddersTemplate.pdf'));
      const pdfDoc = await PDFDocument.load(pdfBytes);

      await addTextToPdf(pdfDoc, fields);

      const downloadUrl = await remoteFile.getSignedUrl(signedUrlConfig);

      res.status(200).json({ downloadUrl: downloadUrl[0] });

    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred during PDF processing.');
    }
  });
};