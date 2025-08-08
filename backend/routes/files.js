const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { createClient } = require('webdav');

const StorageConfig = require('../models/StorageConfig');
const FileAsset = require('../models/FileAsset');
const authenticate = require('../middleware/auth');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 100 } }); // 100MB

function ensureLeadingSlash(p) {
  if (!p) return '/';
  return p.startsWith('/') ? p : `/${p}`;
}

function buildWebdavClient(config) {
  return createClient(config.webdavUrl, {
    username: config.username,
    password: config.appPassword,
  });
}

// Upload a file to Nextcloud and create FileAsset
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    const config = await StorageConfig.findOne({ user: req.userId }).select('+appPassword');
    if (!config) {
      return res.status(400).json({ success: false, error: 'Storage not configured for this user' });
    }

    const client = buildWebdavClient(config);

    const originalName = req.file.originalname;
    const fileExt = path.extname(originalName);
    const baseName = path.basename(originalName, fileExt);
    const uniqueSuffix = `${Date.now()}-${uuidv4().slice(0, 8)}`;
    const remoteFileName = `${baseName}-${uniqueSuffix}${fileExt}`;

    const normalizedRoot = ensureLeadingSlash(config.rootPath || '/');
    const remotePath = path.posix.join(normalizedRoot, remoteFileName);

    await client.putFileContents(remotePath, req.file.buffer, { overwrite: false });

    const fileAsset = await FileAsset.create({
      user: req.userId,
      storageConfig: config._id,
      provider: 'nextcloud',
      remotePath,
      originalName,
      mimeType: req.file.mimetype,
      size: req.file.size,
      status: 'uploaded',
    });

    res.status(201).json({ success: true, file: fileAsset });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List files for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const files = await FileAsset.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get file details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const file = await FileAsset.findOne({ _id: req.params.id, user: req.userId });
    if (!file) return res.status(404).json({ success: false, error: 'File not found' });
    res.status(200).json({ success: true, file });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Download file content by streaming from Nextcloud
router.get('/:id/content', authenticate, async (req, res) => {
  try {
    const file = await FileAsset.findOne({ _id: req.params.id, user: req.userId }).populate({ path: 'storageConfig', select: '+appPassword' });
    if (!file) return res.status(404).json({ success: false, error: 'File not found' });

    const config = file.storageConfig;
    const client = buildWebdavClient(config);

    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(file.remotePath)}"`);

    const stream = client.createReadStream(file.remotePath);
    stream.on('error', (err) => {
      res.status(500).end(`Stream error: ${err.message}`);
    });
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trigger processing via recognition pipeline (stub)
router.post('/:id/process', authenticate, async (req, res) => {
  try {
    const file = await FileAsset.findOne({ _id: req.params.id, user: req.userId });
    if (!file) return res.status(404).json({ success: false, error: 'File not found' });

    const jobId = uuidv4();
    file.status = 'queued';
    file.pipelineJobId = jobId;
    await file.save();

    // TODO: integrate with actual pipeline service here (enqueue job)

    res.status(200).json({ success: true, jobId, file });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;