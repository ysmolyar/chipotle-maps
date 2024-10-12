# ChipotleMaps

ChipotleMaps is a web application that displays Chipotle restaurant locations on an interactive map. Users can view Chipotle locations across the United States and see their current location on the map.

## Project Structure

The project is divided into two main parts:

- `frontend/`: React application for the user interface
- `backend/`: Node.js/Express server for handling API requests and database operations

## Prerequisites

- Node.js (v14 or later recommended)
- npm (usually comes with Node.js)
- MongoDB (Make sure it's installed and running)

## Setup and Installation

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   MONGODB_URI=mongodb://localhost:27017/chipotlemaps
   PORT=5000
   ```

4. Import Chipotle location data (if you have a CSV file):
   ```
   npm run import-data
   ```

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following content:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

## Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. In a new terminal, start the frontend development server:
   ```
   cd frontend
   npm start
   ```

3. Open your browser and visit `http://localhost:3000` to view the application.

## Features

- Interactive map displaying Chipotle locations
- User geolocation to show the user's current position on the map
- Popup information for each Chipotle location

## Technologies Used

- Frontend: React, React Leaflet, Axios
- Backend: Node.js, Express, MongoDB, Mongoose
- Map: Leaflet, OpenStreetMap

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
