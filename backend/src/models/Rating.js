const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  // Use ObjectId reference to Location model
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  // Ensure rating value is between 1 and 5
  ratingValue: { type: Number, required: true, min: 1, max: 5 },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rating', ratingSchema);
