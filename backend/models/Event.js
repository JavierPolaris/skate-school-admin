const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true }, // Asunto del mail
  date: { type: Date, required: true },
  layout: {
    type: String,
    enum: ['header-body-image', 'only-image', 'side-by-side'],
    required: true
  },
  imageUrl: { type: String },
  bodyText: { type: String, required: true },
  published: { type: Boolean, default: false },
  emailSent: { type: Boolean, default: false },
  targetGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  targetAll: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', EventSchema);
