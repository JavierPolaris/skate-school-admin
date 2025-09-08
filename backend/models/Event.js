// models/Event.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  date: { type: Date, default: Date.now },
  layout: {
    type: String,
    enum: ['header-body-image', 'image-header-body', 'only-image'],
    default: 'header-body-image'
  },
  imageUrl: String,
  bodyText: String,
  targetGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  targetAll: { type: Boolean, default: true },
  published: { type: Boolean, default: false },
  emailSent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
