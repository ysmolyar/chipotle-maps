const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const Rating = require('../models/Rating');

router.post('/', async (req, res) => {
  const { locationId, ratingValue } = req.body;

  try {
    const newRating = new Rating({ locationId, ratingValue });
    await newRating.save();

    const location = await Location.findOne({ locationId });
    if (location) {
      location.averageRating = ((location.averageRating * location.ratingsCount) + ratingValue) / (location.ratingsCount + 1);
      location.ratingsCount += 1;
      await location.save();
    }

    res.status(201).json(newRating);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
