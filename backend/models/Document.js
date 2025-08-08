const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalname: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  recognitionMetadata: {
    type: Object,
    default: {}, // For storing file recognition results/metadata
  },
  nextcloudId: {
    type: String,
    default: null, // For linking with Nextcloud if needed
  },
  nextcloudUrl: {
    type: String,
    default: null, // For direct access if synced with Nextcloud
  },
});

module.exports = mongoose.model('Document', DocumentSchema);