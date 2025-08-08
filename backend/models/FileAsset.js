const mongoose = require('mongoose');

const FileAssetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  storageConfig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StorageConfig',
    required: true,
  },
  provider: {
    type: String,
    enum: ['nextcloud'],
    required: true,
    default: 'nextcloud',
  },
  remotePath: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
  },
  size: {
    type: Number,
  },
  hash: {
    type: String,
  },
  status: {
    type: String,
    enum: ['uploaded', 'queued', 'processing', 'completed', 'failed'],
    default: 'uploaded',
    index: true,
  },
  pipelineJobId: {
    type: String,
    index: true,
  },
  recognition: {
    type: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

FileAssetSchema.pre('save', function saveHook(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('FileAsset', FileAssetSchema);