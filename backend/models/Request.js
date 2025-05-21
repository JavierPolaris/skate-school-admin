const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestedRole: { type: String, enum: ['admin', 'student'], default: 'student' }, 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Request', requestSchema);
