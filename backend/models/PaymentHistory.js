// File: backend/models/PaymentHistory.js
const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  method: { type: String, required: true }, // efectivo, bizum, transferencia
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PaymentHistory', paymentHistorySchema);
