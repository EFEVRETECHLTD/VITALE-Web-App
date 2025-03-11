const mongoose = require('mongoose');

const ProtocolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Sample Preparation', 'Assay', 'Analysis', 'Calibration', 'Maintenance', 'Other']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  datePublished: {
    type: Date
  },
  publishTime: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'archived'],
    default: 'draft'
  },
  imageUrl: {
    type: String,
    default: 'https://everyone.plos.org/wp-content/uploads/sites/5/2022/04/feature_image.png'
  },
  keyFeatures: [{
    type: String
  }],
  steps: [{
    order: Number,
    title: String,
    description: String,
    imageUrl: String,
    duration: Number, // in minutes
    warningText: String,
    required: {
      type: Boolean,
      default: true
    }
  }],
  materials: [{
    name: String,
    quantity: String,
    notes: String
  }],
  equipment: [{
    name: String,
    model: String,
    settings: String
  }],
  safety: {
    precautions: [String],
    ppe: [String],
    hazards: [String]
  },
  tags: [{
    type: String
  }],
  visibility: {
    type: String,
    enum: ['public', 'private', 'shared'],
    default: 'private'
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for reviews
ProtocolSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'protocol'
});

// Pre-save middleware to generate slug
ProtocolSchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  next();
});

module.exports = mongoose.model('Protocol', ProtocolSchema);
