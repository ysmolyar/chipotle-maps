// Import React and the useState hook from the 'react' library
import React, { useState } from 'react';
// Import the RatingModal component from a file in the same directory
import RatingModal from './RatingModal';
// Import the CSS file for styling
import './Location.css'; // Make sure to create this CSS file

// Define a functional component named Location that takes two props: location and refreshLocationData
const Location = ({ location, refreshLocationData }) => {
  // Create a state variable 'showRatingModal' and a function to update it 'setShowRatingModal'
  // Initially, showRatingModal is set to false
  const [showRatingModal, setShowRatingModal] = useState(false);

  // The component returns JSX (a mix of HTML and JavaScript)
  return (
    // A div element with a class name for styling
    <div className="location-info">
      {/* Display the location name in an h2 heading */}
      <h2 className="location-name">{location.location}</h2>
      {/* Display the location address in a paragraph */}
      <p>{location.address}</p>
      {/* Display the average rating and number of ratings
          If averageRating exists, display it with 1 decimal place, otherwise show 'N/A' */}
      <p>Average Rating: {location.averageRating ? location.averageRating.toFixed(1) : 'N/A'} ({location.ratingsCount} ratings)</p>
      
      {/* A button that, when clicked, sets showRatingModal to true */}
      <button onClick={() => setShowRatingModal(true)}>Rate Location</button>
      
      {/* Conditional rendering: If showRatingModal is true, render the RatingModal component */}
      {showRatingModal && (
        <RatingModal 
          // Pass the location's ID to the RatingModal
          locationId={location._id} 
          // Pass a function to close the modal (set showRatingModal to false)
          onClose={() => setShowRatingModal(false)} 
          // Pass a function to refresh the location data after submitting a rating
          onRatingSubmit={() => {
            refreshLocationData(location._id);
          }}
        />
      )}
    </div>
  );
};

// Export the Location component so it can be used in other files
export default Location;
