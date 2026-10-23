const mongoose = require('mongoose');

const MLModelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MLJob',
    default: null
  },
  taskType: {
    type: String,
    enum: ['regression', 'classification', 'forecasting'],
    required: true
  },
  algorithm: {
    type: String,
    required: true
  },
  targetColumn: {
    type: String,
    required: true
  },
  featureSchema: [{
    name: String,
    type: String, // 'numeric' | 'categorical'
    mean: Number,
    std: Number,
    categories: [String]
  }],
  metrics: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  modelWeights: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MLModel', MLModelSchema);
