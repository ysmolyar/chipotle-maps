import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import RatingModal from './components/RatingModal';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [locations, setLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [closestLocations, setClosestLocations] = useState([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [locationToRate, setLocationToRate] = useState(null);
  const [searchZipCode, setSearchZipCode] = useState('');
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]); // Default to San Francisco

  useEffect(() => {
    fetchLocations();
    getUserLocation();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/locations`);
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userLoc);
          setMapCenter([userLoc.lat, userLoc.lng]);
          fetchClosestLocations(userLoc.lat, userLoc.lng);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const fetchClosestLocations = async (lat, lng) => {
    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates for fetching closest locations');
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/api/locations/closest`, {
        params: { lat, lng, limit: 5 }
      });
      setClosestLocations(response.data);
    } catch (error) {
      console.error('Error fetching closest locations:', error);
    }
  };

  const handleLocationSelect = (locationId) => {
    const selected = locations.find(loc => loc._id === locationId);
    setSelectedLocation(selected);
    if (selected && selected.coordinates) {
      setMapCenter([selected.coordinates.lat, selected.coordinates.lng]);
    }
  };

  const handleRateLocation = (locationId) => {
    setLocationToRate(locationId);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async (rating) => {
    try {
      await axios.post(`${API_URL}/api/ratings`, {
        locationId: locationToRate,
        ratingValue: rating
      });
      await fetchLocations();
      setShowRatingModal(false);
      setLocationToRate(null);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleZipCodeSearch = async () => {
    try {
      const response = await axios.get(`https://api.zippopotam.us/us/${searchZipCode}`);
      console.log('API response:', response.data); // Log the entire response

      if (!response.data || !response.data.places || response.data.places.length === 0) {
        throw new Error('No location data found for this zip code');
      }

      const { latitude, longitude } = response.data.places[0];
      const newLat = parseFloat(latitude);
      const newLng = parseFloat(longitude);
      
      if (isNaN(newLat) || isNaN(newLng)) {
        throw new Error('Invalid coordinates received from API');
      }
      
      console.log('New coordinates:', newLat, newLng); // Log the parsed coordinates

      const newCenter = [newLat, newLng];
      setMapCenter(newCenter);
      fetchClosestLocations(newLat, newLng);
    } catch (error) {
      console.error('Error fetching zip code data:', error);
      alert('Invalid zip code or error fetching location data: ' + error.message);
    }
  };

  return (
    <div className={`App ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="map-container">
        <Map 
          locations={locations}
          userLocation={userLocation}
          onMarkerClick={handleLocationSelect}
          onRateLocation={handleRateLocation}
          mapCenter={mapCenter}
        />
      </div>
      <Sidebar 
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        closestLocations={closestLocations}
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
        searchZipCode={searchZipCode}
        setSearchZipCode={setSearchZipCode}
        handleZipCodeSearch={handleZipCodeSearch}
      />
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isSidebarOpen ? '»' : '«'}
      </button>
      {showRatingModal && (
        <RatingModal
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
}

export default App;
