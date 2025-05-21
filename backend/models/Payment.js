// File: backend/models/Payment.js
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true }, // efectivo, bizum, transferencia
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);
