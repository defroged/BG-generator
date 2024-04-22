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

  (req, async (err, fields, files) => {
    if (err) {
        console.error(err);
        res.status(500).send('Error parsing form data.');
        return;
    }

    try {
        const pdfBytes = await fs.readFile(path.join(process.cwd(), 'assets', 'snakesAndLaddersTemplate.pdf'));
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        // Combining text and image data
        const items = [];
        Object.keys(fields).forEach(key => {
            if (key.startsWith('box')) {
                items.push({ type: 'text', content: fields[key] });
            }
        });
        Object.keys(files).forEach(key => {
            if (key.startsWith('box') && files[key].length > 0) {
                items.push({ type: 'image', content: files[key][0] });
            }
        });

        // Randomly distributing text and images
        const shuffledItems = items.sort(() => 0.5 - Math.random());

        shuffledItems.forEach((item, index) => {
            const position = calculateImagePosition(index + 1); // assuming calculateImagePosition functions as expected
            if (item.type === 'text') {
                addTextToPdf(pdfDoc, item.content, position);
            } else if (item.type === 'image') {
                addImageToPdf(pdfDoc, item.content, position);
            }
        });

        const newPdfBytes = await pdfDoc.save();

        // Remaining code for handling file storage and response
        const randomKey = Date.now().toString();
        const fileName = `${randomKey}.pdf`;
        const remoteFile = bucket.file(fileName);
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