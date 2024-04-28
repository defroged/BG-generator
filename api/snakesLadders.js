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
  const x = 70 + col * 70;
  const y = 700 - row * 60;
  return { x, y };
}

function prepareFormData(files, fields) {
  const preparedFiles = {};
 
  for (const key in files) {
    if (Object.hasOwnProperty.call(files, key)) {
      const fileData = files[key][0];
      const newKey = key.replace('image', '');
 
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
    if (files[fileKey] && files[fileKey].length > 0) {
      const fileObject = files[fileKey][0];
      
      if (fileObject && fileObject.filepath && fileObject.originalFilename) {
        const position = calculateImagePosition(i);
        imagesInfo.push({
          imagePath: fileObject.filepath,
          originalFilename: fileObject.originalFilename,
          position: position
        });
      }
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
    const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage([pageWidth, pageHeight]);
	
const templatePdf = await PDFDocument.load(templatePdfBytes);

// Create a new PDFDocument and copy first page of template
const pdfDoc = await PDFDocument.create();
const [templatePage] = await pdfDoc.copyPages(templatePdf, [0]);
pdfDoc.addPage(templatePage);

    await addTextToPdf(pdfDoc, fields);
    for (let i = 1; i <= 98; i++) {
  const fileKey = `box${i}`;
  if (files[fileKey] && files[fileKey].length > 0) {
    const fileObject = files[fileKey][0];
    if (fileObject && fileObject.filepath && fileObject.originalFilename) {
      try {
        const position = calculateImagePosition(i);
        await addImageToPdf(pdfDoc, {
          imagePath: fileObject.filepath,
          originalFilename: fileObject.originalFilename,
          position: position
        });
        console.log(`Embedded image at box${i} with position:`, position);
      } catch (err) {
        console.error(`Error processing image at box${i}:`, err);
      }
    }
  }
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