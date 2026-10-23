const mongoose = require('mongoose');

const MLJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  datasetId: {
    type: String,
    default: 'active_dataset'
  },
  taskType: {
    type: String,
    enum: ['regression', 'classification', 'forecasting'],
    required: true
  },
  targetColumn: {
    type: String,
    required: true
  },
  featureColumns: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['queued', 'training', 'completed', 'failed'],
    default: 'completed'
  },
  primaryMetric: {
    type: String,
    default: 'mae'
  },
  modelResults: [{
    algorithm: String,
    name: String,
    primaryMetricValue: Number,
    metrics: mongoose.Schema.Types.Mixed,
    durationMs: Number,
    isBaseline: Boolean,
    rank: Number
  }],
  selectedModel: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  featureImportance: [{
    feature: String,
    importance: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MLJob', MLJobSchema);
