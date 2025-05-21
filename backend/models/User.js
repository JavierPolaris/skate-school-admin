// File: backend/models/Users.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  paymentMethod: { type: String, enum: ['efectivo', 'bizum', 'transferencia', ''], default: '' },
  discount: { type: Number, default: 0 },
  deviceToken: { type: String },
  avatar: { type: String, default: '' },
  notifications: [
    {
      date: { type: Date, default: Date.now },
      message: { type: String }
    }
  ]
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);
