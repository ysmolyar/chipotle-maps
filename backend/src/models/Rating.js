const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  locationId: String,
  ratingValue: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rating', ratingSchema);
