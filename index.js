const express = require('express');
const multer = require('multer');
const { put } = require('@vercel/blob');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Configure multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Generate a random filename using UUID
        const randomFilename = `${uuidv4()}-${req.file.originalname}`;

        // Save the file to Vercel Blob
        const blob = new Blob();
        const result = await put(randomFilename, req.file.buffer, {
            access: 'public',
            token: 'vercel_blob_rw_8A4OsMFXZe2CsEVc_A94jx00fw4KYiVAkwJIsWBDccJQM8h'
        });

        res.status(200).json({ message: 'File uploaded successfully', url: result.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

app.get('/file/:filename', async (req, res) => {
    try {
        const { filename } = req.params;

        // Retrieve the file from Vercel Blob
        const blob = new Blob();
        const file = await blob.get(filename);

        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.setHeader('Content-Type', file.contentType);
        res.send(file.body);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve file' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});