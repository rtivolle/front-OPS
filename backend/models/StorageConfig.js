const mongoose = require('mongoose');

const StorageConfigSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  provider: {
    type: String,
    enum: ['nextcloud'],
    default: 'nextcloud',
    required: true,
  },
  webdavUrl: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  appPassword: {
    type: String,
    required: true,
    select: false,
  },
  rootPath: {
    type: String,
    default: '/',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

StorageConfigSchema.pre('save', function saveHook(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('StorageConfig', StorageConfigSchema);