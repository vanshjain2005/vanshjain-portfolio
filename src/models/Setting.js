const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: String,
    default: ''
  }
}, {
  timestamps: { createdAt: false, updatedAt: 'updated_at' }
});

module.exports = mongoose.models.Setting || mongoose.model('Setting', settingSchema);
