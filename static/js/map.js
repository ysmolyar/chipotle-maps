let map;
let markers = [];

function initMap() {
    map = L.map('map').setView([39.8283, -98.5795], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    fetchLocations();
}

function fetchLocations() {
    fetch('/api/locations')
        .then(response => response.json())
        .then(locations => {
            locations.forEach(location => addMarker(location));
        });
}

function addMarker(location) {
    const marker = L.marker([location.latitude, location.longitude]).addTo(map);
    marker.bindPopup(`
        <h3>${location.name}</h3>
        <p>${location.address}</p>
        <a href="/location/${location.id}" class="text-blue-500 hover:underline">View Details</a>
    `);
    markers.push(marker);
}

document.addEventListener('DOMContentLoaded', initMap);
