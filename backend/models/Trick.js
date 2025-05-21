const mongoose = require('mongoose');

const TrickSchema = new mongoose.Schema({
  name: { type: String, required: true },
  author: { type: String, required: true },
  video: { type: String, required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  completed: { type: Number, default: 0 },
  dateAdded: { type: Date, default: Date.now },
  highlighted: { type: Boolean, default: false },
  doneBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Usuarios que lo completaron
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]  // ✅ Usuarios que dieron like
});

module.exports = mongoose.model('Trick', TrickSchema);
