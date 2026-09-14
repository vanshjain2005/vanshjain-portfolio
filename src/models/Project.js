const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  index_label: {
    type: String,
    required: true,
    default: '01 / 03'
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  meta_tags: {
    type: String,
    default: ''
  },
  live_url: {
    type: String,
    required: true
  },
  accent_color: {
    type: String,
    default: '#dfa874'
  },
  order_index: {
    type: Number,
    default: 0
  },
  is_published: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.models.Project || mongoose.model('Project', projectSchema);
