const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

router.get('/', async (req, res) => {
  try {
    // Fetch locations and include averageRating and ratingsCount in the response
    const locations = await Location.find().select('state location address coordinates averageRating ratingsCount');
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// New GET single location route
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id).select('state location address coordinates averageRating ratingsCount');
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(location);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// New route for getting closest stores
router.get('/closest', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const locations = await Location.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          spherical: true
        }
      },
      { $sort: { distance: 1, averageRating: -1 } },
      { $limit: 5 }
    ]);

    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
