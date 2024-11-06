const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;  // Changed default to 3000

app.use(cors({
  origin: 'http://localhost:3001' // frontend port
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const locationsRouter = require('./routes/locations');
const ratingsRouter = require('./routes/ratings');

app.use('/api/locations', locationsRouter);
app.use('/api/ratings', ratingsRouter);

// Routes will be added here

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
