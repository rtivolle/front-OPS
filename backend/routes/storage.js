const express = require('express');
const { createClient } = require('webdav');
const StorageConfig = require('../models/StorageConfig');
const authenticate = require('../middleware/auth');

const router = express.Router();

function ensureLeadingSlash(path) {
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function buildWebdavClient(config) {
  return createClient(config.webdavUrl, {
    username: config.username,
    password: config.appPassword,
  });
}

// Get current user's storage config (without sensitive fields)
router.get('/config', authenticate, async (req, res) => {
  try {
    const config = await StorageConfig.findOne({ user: req.userId }).lean();
    if (!config) return res.status(200).json({ success: true, config: null });

    const { appPassword, __v, ...safeConfig } = config;
    return res.status(200).json({ success: true, config: safeConfig });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Create or update storage config
router.post('/config', authenticate, async (req, res) => {
  try {
    const { webdavUrl, username, appPassword, rootPath } = req.body;

    if (!webdavUrl || !username || !appPassword) {
      return res.status(400).json({ success: false, error: 'webdavUrl, username and appPassword are required' });
    }

    const normalizedRoot = ensureLeadingSlash(rootPath || '/');

    // Upsert configuration
    const config = await StorageConfig.findOneAndUpdate(
      { user: req.userId },
      {
        user: req.userId,
        provider: 'nextcloud',
        webdavUrl,
        username,
        appPassword,
        rootPath: normalizedRoot,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Validate connectivity and ensure root directory exists
    const client = buildWebdavClient(config);
    try {
      await client.stat(normalizedRoot);
    } catch (err) {
      // Create if missing
      await client.createDirectory(normalizedRoot);
    }

    const { appPassword: _, __v, ...safeConfig } = config.toObject();
    return res.status(200).json({ success: true, config: safeConfig });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;