#!/bin/bash

# Set environment variables
export MONGODB_URI="mongodb://localhost:27017/chipotlemaps"
export BACKEND_PORT=3000
export FRONTEND_PORT=3001

# MongoDB data path for M2 Macs
MONGO_DATA_PATH="/opt/homebrew/var/mongodb"

# Check if MongoDB is running
echo "Checking MongoDB status..."
if ! pgrep -x "mongod" > /dev/null
then
    echo "MongoDB is not running. Attempting to start MongoDB..."
    
    # Try to start MongoDB without forking, using the M2 Mac data path
    mongod --dbpath "$MONGO_DATA_PATH" &
    
    # Wait for MongoDB to start
    for i in {1..30}; do
        if mongosh --eval "db.serverStatus()" &>/dev/null; then
            echo "MongoDB started successfully."
            break
        fi
        if [ $i -eq 30 ]; then
            echo "Failed to start MongoDB. Please check your MongoDB installation and configuration."
            exit 1
        fi
        echo "Waiting for MongoDB to start... (attempt $i/30)"
        sleep 1
    done
else
    echo "MongoDB is already running."
fi

# Navigate to backend directory
cd backend

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Check if data has already been imported
echo "Checking if data has been imported..."
DATA_COUNT=$(mongosh --quiet --eval "db.locations.countDocuments()" chipotlemaps)

if [ "$DATA_COUNT" -eq 0 ]; then
    echo "No data found. Importing data..."
    node src/scripts/importData.js
else
    echo "Data already exists. Skipping import."
fi

# Start the backend server
echo "Starting backend server..."
PORT=$BACKEND_PORT npm start &

# Wait for the backend to start up
sleep 5

# Navigate to frontend directory
cd ../frontend

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Set frontend environment variables
echo "REACT_APP_API_URL=http://localhost:$BACKEND_PORT" > .env
echo "PORT=$FRONTEND_PORT" >> .env

# Start the frontend server
echo "Starting frontend server..."
npm start &

# Wait for both servers to be ready
wait
