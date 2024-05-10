const mime = require('mime-types');
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

function prepareFormData(files, fields) {
  const preparedFiles = {};

  for (const key in files) {
    if (Object.hasOwnProperty.call(files, key)) {
      const fileData = files[key][0];
      const newKey = key.replace('image', '');
      fileData.contentType = mime.lookup(fileData.name);

      if (!fields[newKey]) {
        fields[newKey] = [];
      }

      fields[newKey].push(fileData);
      preparedFiles[newKey] = fileData;
    }
  }

  return {
    fields,
    files: preparedFiles,
  };
}

async function prepareImagesForProcessing(files) {
  const imagesInfo = [];
   console.log('All files:', files); 
  for (let i = 1; i <= 98; i++) {
    const fileKey = `box${i}`;
    if (files[fileKey] && files[fileKey].length > 0) {
		console.log(`Processing file ${fileKey}:`, files[fileKey]);
      const fileObject = files[fileKey][0];
      if (fileObject && fileObject.filepath && fileObject.name) {
        const position = calculateImagePosition(i);
        const imageInfo = {
          imagePath: fileObject.filepath,
          originalFilename: fileObject.name,
          position: position,
          contentType: fileObject.contentType,
        };
        imagesInfo.push(imageInfo);
      }
    }
  }
  console.log('Processed images:', imagesInfo);
  return imagesInfo;
}

module.exports = async (req, res) => {
  const form = new formidable.IncomingForm({
    multiples: true,
    keepExtensions: true,
    allowEmptyFiles: true,
  });

  form.parse(req, async (err, originalFields, originalFiles) => {
    if (err) {
      res.status(500).send('Error parsing form data.');
      return;
    }
 console.log('Uploaded files:', originalFiles);
    const preparedData = prepareFormData(originalFiles, originalFields);
    const { fields, files } = preparedData;

    try {
      const pdfBytes = await fs.readFile(path.join(process.cwd(), 'assets', 'snakesAndLaddersTemplate.pdf'));
      const pdfDoc = await PDFDocument.load(pdfBytes);

      await addTextToPdf(pdfDoc, fields);
      const imagesInfo = await prepareImagesForProcessing(files);

      for (const imageInfo of imagesInfo) {
        await addImageToPdf(pdfDoc, imageInfo);
      }

      const newPdfBytes = await pdfDoc.save();
      const fileName = `${Date.now()}.pdf`;
      const remoteFile = bucket.file(fileName);
      await remoteFile.save(Buffer.from(newPdfBytes), {
        contentType: 'application/pdf',
      });

      const signedUrlConfig = {
        action: 'read',
        expires: '2024-10-03T10:05:00Z',
        responseType: 'attachment',
      };

      const downloadUrl = await remoteFile.getSignedUrl(signedUrlConfig);
      res.status(200).json({ downloadUrl: downloadUrl[0] });
    } catch (error) {
      res.status(500).send('An error occurred during PDF processing.');
    }
  });
};