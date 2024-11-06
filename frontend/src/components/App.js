// Import necessary dependencies from React and other libraries
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Import custom components
import Map from './Map';
import Location from './Location';
import Sidebar from './Sidebar';

// Get the API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL;

// Define the main App component
const App = () => {
  // Define state variables using useState hook
  // locations: array to store all location data
  // selectedLocation: object to store the currently selected location
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [closestLocations, setClosestLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  // useEffect hook to run once when the component mounts
  useEffect(() => {
    fetchLocations();
    getUserLocation();
  }, []);

  // useEffect hook to run when userLocation changes
  useEffect(() => {
    if (userLocation) {
      fetchClosestLocations();
    }
  }, [userLocation]);

  // Function to fetch all locations from the API
  const fetchLocations = async () => {
    try {
      // Make a GET request to the API
      const response = await axios.get(`${API_URL}/api/locations`);
      // Update the locations state with the fetched data
      setLocations(response.data);
    } catch (error) {
      // Log any errors that occur during the fetch
      console.error('Error fetching locations:', error);
    }
  };

  // Function to fetch details of a specific location
  const fetchLocationDetails = async (locationId) => {
    try {
      // Make a GET request to the API for a specific location
      const response = await axios.get(`${API_URL}/api/locations/${locationId}`);
      // Update the selectedLocation state with the fetched data
      setSelectedLocation(response.data);
    } catch (error) {
      // Log any errors that occur during the fetch
      console.error('Error fetching location details:', error);
    }
  };

  // Function to refresh data for a specific location and all locations
  const refreshLocationData = async (locationId) => {
    // Fetch updated details for the specific location
    await fetchLocationDetails(locationId);
    // Refresh all locations to update markers if needed
    await fetchLocations();
    if (userLocation) {
      await fetchClosestLocations();
    }
  };

  // Function to get the user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  // Function to fetch the closest locations to the user's location
  const fetchClosestLocations = async () => {
    try {
      // Make a GET request to the API for the closest locations
      const response = await axios.get(`${API_URL}/api/locations/closest`, {
        params: userLocation
      });
      // Update the closestLocations state with the fetched data
      setClosestLocations(response.data);
    } catch (error) {
      // Log any errors that occur during the fetch
      console.error('Error fetching closest locations:', error);
    }
  };

  // Render the component
  return (
    <div className="app-container">
      <Sidebar 
        closestLocations={closestLocations} 
        onLocationSelect={(locationId) => fetchLocationDetails(locationId)}
      />
      <div className="main-content">
        {/* Render the Map component, passing necessary props */}
        <Map 
          locations={locations} 
          onMarkerClick={(locationId) => fetchLocationDetails(locationId)}
          userLocation={userLocation}
        />
        {/* Conditionally render the Location component if a location is selected */}
        {selectedLocation && (
          <Location 
            location={selectedLocation} 
            refreshLocationData={refreshLocationData}
          />
        )}
      </div>
    </div>
  );
};

// Export the App component as the default export
export default App;
