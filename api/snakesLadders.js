const { addTextToPdf, addImageToPdf } = require('../snakesMapper');
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
    console.log('Parsed Files:', files);// new logs
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

for (let i = 1; i <= 98; i++) {
     const fileKey = `box${i}Image`;
     if (files && files[fileKey]) {
       const imagePath = files[fileKey].path;  // Ensure this corresponds to the 'path' attribute from formidable
       const position = calculateImagePosition(i); 

       console.log(`Processing image for box ${i}:`, imagePath);
       await addImageToPdf(pdfDoc, imagePath, position);
     }
   }
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

function calculateImagePosition(boxIndex) {
  const row = Math.floor((boxIndex - 1) % 10);
  const col = Math.floor((boxIndex - 1) / 10);
  const x = 20 + col * 70; 
  const y = 550 - row * 60; 
  return { x, y };
}

  });
};