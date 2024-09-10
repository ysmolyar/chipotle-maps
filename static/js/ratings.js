function submitRating(locationId) {
    const form = document.getElementById('rating-form');
    const formData = new FormData(form);
    const rating = Object.fromEntries(formData.entries());
    rating.location_id = locationId;

    fetch('/api/ratings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rating),
    })
    .then(response => response.json())
    .then(data => {
        alert('Rating submitted successfully!');
        form.reset();
        location.reload();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to submit rating. Please try again.');
    });
}

function toggleRatingForm() {
    const form = document.querySelector('.rating-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}
