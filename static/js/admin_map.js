let adminMap;
let markers = {};
let currentMarker;

function initAdminMap() {
    adminMap = L.map('admin-map').setView([37.7749, -122.4194], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(adminMap);

    adminMap.on('click', function(e) {
        if (currentMarker) {
            adminMap.removeLayer(currentMarker);
        }
        currentMarker = L.marker(e.latlng).addTo(adminMap);
        
        document.getElementById('latitude').value = e.latlng.lat.toFixed(6);
        document.getElementById('longitude').value = e.latlng.lng.toFixed(6);
    });

    loadLocations();
}

function loadLocations() {
    fetch('/api/locations')
        .then(response => response.json())
        .then(locations => {
            const locationList = document.getElementById('location-list');
            locationList.innerHTML = '';
            locations.forEach(location => {
                addLocationToList(location);
                addMarkerToMap(location);
            });
        });
}

function addLocationToList(location) {
    const locationList = document.getElementById('location-list');
    const li = document.createElement('li');
    li.className = 'mb-2';
    li.innerHTML = `
        <strong>${location.name}</strong> - ${location.address}
        <button onclick="editLocation(${location.id})" class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 ml-2">Edit</button>
        <button onclick="deleteLocation(${location.id})" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ml-2">Delete</button>
    `;
    locationList.appendChild(li);
}

function addMarkerToMap(location) {
    const marker = L.marker([location.latitude, location.longitude]).addTo(adminMap);
    marker.bindPopup(`<b>${location.name}</b><br>${location.address}`);
    markers[location.id] = marker;
}

function editLocation(id) {
    const location = markers[id].getLatLng();
    document.getElementById('location-id').value = id;
    document.getElementById('latitude').value = location.lat.toFixed(6);
    document.getElementById('longitude').value = location.lng.toFixed(6);
    
    fetch(`/api/locations/${id}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('name').value = data.name;
            document.getElementById('address').value = data.address;
        });
    
    if (currentMarker) {
        adminMap.removeLayer(currentMarker);
    }
    currentMarker = markers[id];
    adminMap.setView(location, 15);
}

function deleteLocation(id) {
    if (confirm('Are you sure you want to delete this location?')) {
        fetch(`/api/locations/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                adminMap.removeLayer(markers[id]);
                delete markers[id];
                loadLocations();
            });
    }
}

document.getElementById('location-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('location-id').value;
    const data = {
        name: document.getElementById('name').value,
        address: document.getElementById('address').value,
        latitude: parseFloat(document.getElementById('latitude').value),
        longitude: parseFloat(document.getElementById('longitude').value)
    };

    const url = id ? `/api/locations/${id}` : '/api/locations';
    const method = id ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        alert(result.message);
        loadLocations();
        document.getElementById('location-form').reset();
        document.getElementById('location-id').value = '';
        if (currentMarker) {
            adminMap.removeLayer(currentMarker);
            currentMarker = null;
        }
    });
});

document.addEventListener('DOMContentLoaded', initAdminMap);

// Function to show location preview in modal
function showLocationPreview(location) {
    const modal = document.getElementById('locationModal');
    const modalBody = modal.querySelector('.modal-body');
    
    // Clear previous content
    modalBody.innerHTML = '';

    // Add new content
    const locationPreview = document.createElement('div');
    locationPreview.innerHTML = `
        <h5>${location.name}</h5>
        <p>${location.address}</p>
        <div id="mapPreview" style="height: 300px;"></div>
    `;
    modalBody.appendChild(locationPreview);

    // Initialize map preview
    const mapPreview = L.map('mapPreview').setView([location.lat, location.lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapPreview);
    L.marker([location.lat, location.lng]).addTo(mapPreview);

    // Show modal
    $('#locationModal').modal('show');
}

// Example usage
map.on('click', function(e) {
    const location = {
        name: 'Chipotle Mexican Grill',
        address: '123 Main St, Anytown, USA',
        lat: e.latlng.lat,
        lng: e.latlng.lng
    };
    showLocationPreview(location);
});
