const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    default: 0
  },
  sheetsCount: {
    type: Number,
    default: 1
  },
  sheetNames: [{
    type: String
  }],
  totalRows: {
    type: Number,
    default: 0
  },
  totalColumns: {
    type: Number,
    default: 0
  },
  columns: {
    type: Array,
    default: []
  },
  sampleData: {
    type: mongoose.Schema.Types.Mixed
  },
  aiInsight: {
    type: String,
    default: ''
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Upload', UploadSchema);
