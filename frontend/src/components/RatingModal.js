import React, { useState } from 'react';
import './RatingModal.css';

const RatingModal = ({ onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(rating);
  };

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal">
        <h2>Rate this Location</h2>
        <form onSubmit={handleSubmit}>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= rating ? 'star active' : 'star'}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
          <button type="submit" disabled={rating === 0}>Submit Rating</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
