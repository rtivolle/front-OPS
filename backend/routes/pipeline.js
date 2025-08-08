const express = require('express');
const FileAsset = require('../models/FileAsset');

const router = express.Router();

function verifyCallbackSecret(req) {
  const token = req.query.token || req.headers['x-callback-token'];
  return token && process.env.PIPELINE_CALLBACK_SECRET && token === process.env.PIPELINE_CALLBACK_SECRET;
}

// Callback from external recognition pipeline
router.post('/callback', async (req, res) => {
  try {
    if (!verifyCallbackSecret(req)) {
      return res.status(401).json({ success: false, error: 'Invalid callback token' });
    }

    const { jobId, status, results, error } = req.body || {};
    if (!jobId) return res.status(400).json({ success: false, error: 'jobId is required' });

    const file = await FileAsset.findOne({ pipelineJobId: jobId });
    if (!file) return res.status(404).json({ success: false, error: 'File not found for this jobId' });

    if (status === 'processing') file.status = 'processing';
    else if (status === 'completed') {
      file.status = 'completed';
      file.recognition = results || {};
    } else if (status === 'failed') {
      file.status = 'failed';
      file.recognition = { error: error || 'Processing failed' };
    }

    await file.save();
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;