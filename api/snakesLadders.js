const { addTextToPdf } = require('../snakesMapper');
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

async function processFormData(fields, files) {
  const images = Object.entries(files).filter(([key, value]) => key.startsWith('image'));
  let boxCount = 1;

  for (const [key, imageFile] of images) {
    if (imageFile.size > 0) {
      const imageBytes = await fs.readFile(imageFile.path);
      fields[`box${boxCount}`] = imageBytes;
      boxCount++;
    }
  }

  for (const [key, value] of Object.entries(fields)) {
    if (key.startsWith('box') && value.length > 0) {
      fields[key] = value[0];
      boxCount++;
    } else {
      delete fields[key];
    }
  }

  return fields;
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
    let processedFields = {};
    const textItems = Object.keys(fields).filter((key) => key.startsWith('box')).length;
    const imageItems = Object.keys(files).filter((key) => key.startsWith('image')).length;
    if (textItems > 0 || imageItems > 0) {
      processedFields = await processFormData(fields, files);
    } else {
      res.status(400).send('At least one text or image input is required.');
      return;
    }

    await addTextToPdf(pdfDoc, processedFields);

  const newPdfBytes = await pdfDoc.save();

  const randomKey = Date.now().toString();
  const fileName = `${randomKey}.pdf`;
  console.log('fileName:', fileName);
  const remoteFile = bucket.file(fileName);
  console.log('remoteFile:', remoteFile);
  await remoteFile.save(Buffer.from(newPdfBytes), { contentType: 'application/pdf' });

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