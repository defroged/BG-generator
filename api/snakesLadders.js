const { addContentToPdf } = require('../snakesMapper'); 
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
    console.log('Parsed Fields:', fields);
    console.log('Parsed Files:', files);
    if (err) {
      console.error(err);
      res.status(500).send('Error parsing form data.');
      return;
    }

    try {
      const pdfBytes = await fs.readFile(path.join(process.cwd(), 'assets', 'snakesAndLaddersTemplate.pdf'));
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Use the new function to handle all content
      await addContentToPdf(pdfDoc, fields, files);

      const newPdfBytes = await pdfDoc.save();
      const fileName = `${Date.now()}.pdf`;
      const remoteFile = bucket.file(fileName);

      await remoteFile.save(Buffer.from(newPdfBytes), { contentType: 'application/pdf' });
      const signedUrlConfig = { action: 'read', expires: Date.now() + 15 * 60 * 1000 }; // 15 minutes
      const downloadUrl = await remoteFile.getSignedUrl(signedUrlConfig);

      res.status(200).json({ downloadUrl: downloadUrl[0] });
    } catch (error) {
      console.error('Error during PDF processing:', error);
      res.status(500).send('An error occurred during PDF processing.');
    }
  });
};