// File: backend/models/PaymentConfig.js
const mongoose = require('mongoose');

const paymentConfigSchema = new mongoose.Schema({
  method: { type: String, required: true }, // efectivo, bizum, transferencia
  message: String, // Instrucciones o información adicional
  phone: String,   // Solo para bizum
  accountNumber: String, // Solo para transferencia
  subject: String  // Solo para transferencia
});

module.exports = mongoose.model('PaymentConfig', paymentConfigSchema);
