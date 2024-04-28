const fs = require('fs/promises');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

(async () => {
  // Replace this with the actual path of an image file on your machine for testing
  const imageFilePath = 'test.png';

  // Read the test image file as Uint8Array
  const imageBytes = await fs.readFile(imageFilePath);

  // Detect the image extension/type
  const imageType = path.extname(imageFilePath).substring(1).toLowerCase();

  // Create a new PDF document and add a blank page
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([700, 700]);

  let pdfImage;
  if (imageType === 'jpg' || imageType === 'jpeg') {
    pdfImage = await pdfDoc.embedJpg(imageBytes);
  } else if (imageType === 'png') {
    pdfImage = await pdfDoc.embedPng(imageBytes);
  } else {
    throw new Error('Unsupported image type: ' + imageType);
  }

  // Draw the image at the specified position
  page.drawImage(pdfImage, {
    x: 100,
    y: 500,
    width: 100,
    height: 100,
  });

  // Save the PDF as Uint8Array and write it to a new file
  const pdfBytes = await pdfDoc.save();
  await fs.writeFile('test_output.pdf', pdfBytes);

  console.log('Test PDF has been successfully created!');
})();