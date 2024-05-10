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
      console.log(`Image - Image ContentType: ${fileData.contentType}`);
	  
 
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

// Define the new function here; this assumes 'calculateImagePosition' is available in your script
async function prepareImagesForProcessing(files) {
  const imagesInfo = [];
  for (let i = 1; i <= 98; i++) {
    const fileKey = `box${i}`;
    console.log(`Checking for file at key: ${fileKey}`);
    if (files[fileKey] && files[fileKey].length > 0) {
      const fileObject = files[fileKey][0];
      console.log(`Found fileObject for key ${fileKey}:`, fileObject);

      if (fileObject && fileObject.filepath && fileObject.name) { // Change this line to 'fileObject.name'
        const position = calculateImagePosition(i);
        console.log(`Image ${i} - Position: (${position.x}, ${position.y}), Image Path: ${fileObject.filepath}, Image Name: ${fileObject.name}`);

        imagesInfo.push({
		  console.log('ImageInfo:', imageInfo);
          imagePath: fileObject.filepath,
          originalFilename: fileObject.name, // Change this line to 'fileObject.name'
          position: position,
        });
      } else {
        console.log(`Image ${i} - Invalid file object, filepath or name missing`); // Change this log message to 'name missing'
      }
    } else {
      console.log(`No file found for key: ${fileKey}`);
    }
  }
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
    console.error(err);
    res.status(500).send('Error parsing form data.');
    return;
  }

  const preparedData = prepareFormData(originalFiles, originalFields);
  const { fields, files } = preparedData;

  try {
    const pdfBytes = await fs.readFile(path.join(process.cwd(), 'assets', 'snakesAndLaddersTemplate.pdf'));
    const pdfDoc = await PDFDocument.load(pdfBytes);

    await addTextToPdf(pdfDoc, fields);
	console.log('Preparing Images for Processing');
	console.log('Files:', files);
    const imagesInfo = await prepareImagesForProcessing(files);  // Use the renamed keys

    for (const imageInfo of imagesInfo) {
      await addImageToPdf(pdfDoc, imageInfo);
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