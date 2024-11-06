const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const Rating = require('../models/Rating');

router.post('/', async (req, res) => {
  const { locationId, ratingValue } = req.body;

  try {
    // Check if the location exists
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Validate rating value
    if (ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Create and save the new rating
    const newRating = new Rating({ locationId, ratingValue });
    await newRating.save();

    // Update location's average rating and ratings count
    const ratings = await Rating.find({ locationId });
    const totalRating = ratings.reduce((sum, rating) => sum + rating.ratingValue, 0);
    const averageRating = totalRating / ratings.length;

    location.averageRating = averageRating;
    location.ratingsCount = ratings.length;
    await location.save();

    res.status(201).json(newRating);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
