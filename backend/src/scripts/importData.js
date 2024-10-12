const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Location = require('../models/Location');
require('dotenv').config();

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    console.log('Connected to MongoDB');

    const results = [];
    fs.createReadStream('chipotle_locations.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        for (const row of results) {
          try {
            const location = new Location({
              state: row.state,
              location: row.location,
              address: row.address,
              coordinates: {
                lat: parseFloat(row.latitude),
                lng: parseFloat(row.longitude)
              }
            });
            await location.save();
            console.log(`Imported: ${location.location}, ${location.state}`);
          } catch (err) {
            console.error(`Error importing ${row.location}, ${row.state}:`, err.message);
          }
        }
        console.log('CSV file successfully processed');
        await mongoose.disconnect();
      });
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

importData();
