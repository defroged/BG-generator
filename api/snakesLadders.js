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

function calculateImagePosition(boxIndex) {
  const row = Math.floor((boxIndex - 1) % 10);
  const col = Math.floor((boxIndex - 1) / 10);
  const x = 20 + col * 70; 
  const y = 550 - row * 60; 
  return { x, y };
}

// Define the new function here; this assumes 'calculateImagePosition' is available in your script
async function prepareImagesForProcessing(files) {
  const imagesInfo = [];
  for (let i = 1; i <= 98; i++) {
    const fileKey = `box${i}`;
    if (files[fileKey]) {
      const fileObject = files[fileKey][0]; // Ensure you access the first element of the array
      const position = calculateImagePosition(i);
      imagesInfo.push({
        imagePath: fileObject.filepath,
        originalFilename: fileObject.originalFilename,
        position: position
      });
    }
  }
  return imagesInfo;
}

module.exports = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.multiples = true;

  form.parse(req, async (err, fields, files) => {
	   console.log(files); 
    if (err) {
      console.error(err);
      res.status(500).send('Error parsing form data.');
      return;
    }

    // Process and rename keys for images in the files object
    let processedFiles = {};
    Object.keys(files).forEach(key => {
      // Expected key format is 'box{number}Image'
      const newKey = key.replace('Image', ''); // Rename key
      processedFiles[newKey] = files[key];
    });

    try {
      const pdfBytes = await fs.readFile(path.join(process.cwd(), 'assets', 'snakesAndLaddersTemplate.pdf'));
      const pdfDoc = await PDFDocument.load(pdfBytes);

      await addTextToPdf(pdfDoc, fields);
      const imagesInfo = await prepareImagesForProcessing(processedFiles); // Use the renamed keys

      for (const imageInfo of imagesInfo) {
  await addImageToPdf(pdfDoc, imageInfo, imageInfo.position); // Pass the entire imageInfo object
}
      
      const newPdfBytes = await pdfDoc.save();
      const fileName = `${Date.now()}.pdf`;
      const remoteFile = bucket.file(fileName);
      await remoteFile.save(Buffer.from(newPdfBytes), {
        contentType: 'application/pdf'
      });

      const signedUrlConfig = {
        action: 'read',
        expires: '2024-10-03T10:05:00Z',  // Adjust the expiration time as needed
        responseType: 'attachment'
      };

      const downloadUrl = await remoteFile.getSignedUrl(signedUrlConfig);
      res.status(200).json({ downloadUrl: downloadUrl[0] });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred during PDF processing.');
    }
  });
};