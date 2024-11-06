import React from 'react';

const Sidebar = ({ 
  closestLocations, 
  onLocationSelect, 
  selectedLocation,
  searchZipCode,
  setSearchZipCode,
  handleZipCodeSearch
}) => {
  return (
    <div className="sidebar">
      <div className="sidebar-search">
        <h2>Find Nearest Stores</h2>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Enter ZIP code" 
            value={searchZipCode}
            onChange={(e) => setSearchZipCode(e.target.value)}
          />
          <button onClick={handleZipCodeSearch}>Search</button>
        </div>
      </div>
      <div className="sidebar-nearest">
        <h3>Nearest Stores:</h3>
        <ul>
          {closestLocations.map(location => (
            <li key={location._id} onClick={() => onLocationSelect(location._id)}>
              <h4>{location.location}</h4>
              <p>Distance: {location.distance ? `${location.distance.toFixed(2)} km` : 'N/A'}</p>
              <p>Rating: {location.averageRating ? location.averageRating.toFixed(1) : 'N/A'}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
