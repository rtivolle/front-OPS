const express = require('express');
const router = express.Router();
const multer = require('multer');
const Document = require('../models/Document');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Simple JWT auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userDir = path.join(__dirname, '../../uploads', req.user.id);
    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Upload a file
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const doc = await Document.create({
      user: req.user.id,
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      // recognitionMetadata: {}, // To be filled by pipeline
    });
    res.status(201).json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// List user's files
router.get('/', authenticateToken, async (req, res) => {
  try {
    const docs = await Document.find({ user: req.user.id }).sort({ uploadDate: -1 });
    res.json({ success: true, documents: docs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Download a file
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user.id });
    if (!doc) return res.status(404).json({ success: false, error: 'File not found' });
    const filePath = path.join(__dirname, '../../uploads', req.user.id, doc.filename);
    res.download(filePath, doc.originalname);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;