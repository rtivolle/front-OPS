const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');

// Configure multer for memory storage (or disk storage if large files)
// Using memory storage for simplicity to stream directly, but valid for <10MB
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// @desc    Upload file to Nextcloud
// @route   POST /api/upload
router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { originalname, buffer } = req.file;
    // const userId = req.user.id; // If auth middleware is used

    // Nextcloud WebDAV URL
    // Typically: remote.php/dav/files/USER/path/to/file
    const nextcloudUrl = process.env.NEXTCLOUD_URL;
    const nextcloudUser = process.env.NEXTCLOUD_USER;
    const nextcloudPass = process.env.NEXTCLOUD_APP_PASSWORD;

    if (!nextcloudUrl || !nextcloudUser || !nextcloudPass) {
        console.error('Nextcloud configuration missing');
        return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    // Default upload directory in Nextcloud
    const uploadDir = 'Documents';
    // Ensure filename is safe or just use original
    const encodedName = encodeURIComponent(originalname);

    // WebDAV path
    const webDavUrl = `${nextcloudUrl}/remote.php/dav/files/${nextcloudUser}/${uploadDir}/${encodedName}`;

    try {
        // Stream buffer to Nextcloud
        await axios.put(webDavUrl, buffer, {
            auth: {
                username: nextcloudUser,
                password: nextcloudPass
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        // console.log(`File uploaded to Nextcloud: ${webDavUrl}`);

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            path: `/${uploadDir}/${originalname}`
        });

    } catch (error) {
        console.error('Nextcloud Upload Failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        res.status(502).json({ success: false, error: 'Failed to upload to storage backend' });
    }
});

module.exports = router;
