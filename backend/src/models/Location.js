const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  state: String,
  location: String,
  address: String,
  coordinates: {
    lat: Number,
    lng: Number
  }
});

module.exports = mongoose.model('Location', locationSchema);
