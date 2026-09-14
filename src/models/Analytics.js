const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  event_type: {
    type: String,
    required: true,
    index: true
  },
  target: {
    type: String,
    default: ''
  },
  ip_address: {
    type: String,
    default: ''
  },
  user_agent: {
    type: String,
    default: ''
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);
