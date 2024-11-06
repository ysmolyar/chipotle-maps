const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  state: String,
  location: String,
  address: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  // Add fields for average rating and ratings count
  averageRating: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Location', locationSchema);
