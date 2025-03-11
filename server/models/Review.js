const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  protocol: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Protocol',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  comment: {
    type: String,
    required: true
  },
  attachments: {
    type: [String],
    default: []
  },
  metrics: {
    efficiency: {
      type: Number,
      min: 1,
      max: 5
    },
    consistency: {
      type: Number,
      min: 1,
      max: 5
    },
    accuracy: {
      type: Number,
      min: 1,
      max: 5
    },
    safety: {
      type: Number,
      min: 1,
      max: 5
    },
    easeOfExecution: {
      type: Number,
      min: 1,
      max: 5
    },
    scalability: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only review a protocol once
ReviewSchema.index({ protocol: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
