// models/Group.js
const mongoose = require('mongoose');

const classDateSchema = new mongoose.Schema({
  date: Date,
  startTime: String,
  endTime: String,
  place: { type: String, default: 'Skate park Bola de Oro' } // ✅ Añadido lugar con valor por defecto
}, { _id: false });

const notificationSchema = new mongoose.Schema({
  message: String,
  date: { type: Date, default: Date.now }
}, { _id: false });

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  scheduledDates: [classDateSchema],
  notifications: [notificationSchema],
  ranking: { type: Number, default: 0 },
  previousRanking: { type: Number, default: 0 },
  tricks: String,
  avatar: { type: String, default: '' }
});

module.exports = mongoose.model('Group', groupSchema);
