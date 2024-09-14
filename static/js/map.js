console.log("map.js is being executed");

let map;
let markers = {};
let currentMarker;
let isAdmin = false;

function getUserLocation(callback) {
    console.log("Getting user location");
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            position => {
                console.log("User location obtained:", position.coords);
                callback([position.coords.latitude, position.coords.longitude]);
            },
            error => {
                console.error("Error getting user location:", error);
                callback(null);
            }
        );
    } else {
        console.log("Geolocation is not available");
        callback(null);
    }
}

function initMap() {
    console.log("Initializing map");
    getUserLocation(location => {
        const defaultView = [39.8283, -98.5795];
        const zoom = location ? 13 : 4;
        
        console.log("Creating map with view:", location || defaultView);
        map = L.map('map', {
            zoomControl: false
        }).setView(location || defaultView, zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.control.zoom({
            position: 'topright'
        }).addTo(map);

        fetchLocations();
        
        // Check if user is logged in
        fetch('/api/check_login')
            .then(response => response.json())
            .then(data => {
                isAdmin = data.logged_in;
                if (isAdmin) {
                    enableAdminFeatures();
                }
            });

        map.on('click', function(e) {
            const location = {
                name: 'Chipotle Mexican Grill',
                address: '123 Main St, Anytown, USA',
                lat: e.latlng.lat,
                lng: e.latlng.lng
            };
            showLocationPreview(location);
        });

        // Hide splash screen when map is ready
        hideSplashScreen();
    });
}

function hideSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    splashScreen.classList.add('fade-out');
    setTimeout(() => {
        splashScreen.style.display = 'none';
    }, 500); // Wait for fade out animation to complete
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
    
    const popupContent = `
        <div class="location-popup">
            <h3 class="text-lg font-bold mb-2">${location.name}</h3>
            <p class="text-sm mb-2">${location.address}</p>
            <div class="flex justify-between items-center">
                <a href="/location/${location.id}" class="view-details-btn">View Details</a>
                ${location.average_rating ? 
                    `<span class="text-sm font-semibold">Rating: ${location.average_rating.toFixed(1)}/5</span>` : 
                    '<span class="text-sm text-gray-500">No ratings yet</span>'}
            </div>
            ${isAdmin ? `
            <div class="mt-2">
                <button onclick="editLocation(${location.id})" class="admin-btn edit-btn">Edit</button>
                <button onclick="deleteLocation(${location.id})" class="admin-btn delete-btn">Delete</button>
            </div>
            ` : ''}
        </div>
    `;

    marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
    });
    
    markers[location.id] = marker;
}

function enableAdminFeatures() {
    const addLocationButton = document.getElementById('add-location');
    const locationForm = document.getElementById('location-form');
    const cancelLocationButton = document.getElementById('cancel-location');

    if (addLocationButton) {
        addLocationButton.style.display = 'inline-block';
        addLocationButton.addEventListener('click', () => {
            locationForm.classList.remove('hidden');
            map.once('click', function(e) {
                document.getElementById('latitude').value = e.latlng.lat.toFixed(6);
                document.getElementById('longitude').value = e.latlng.lng.toFixed(6);
                if (currentMarker) {
                    map.removeLayer(currentMarker);
                }
                currentMarker = L.marker(e.latlng).addTo(map);
            });
        });
    }

    if (cancelLocationButton) {
        cancelLocationButton.addEventListener('click', () => {
            locationForm.classList.add('hidden');
            if (currentMarker) {
                map.removeLayer(currentMarker);
                currentMarker = null;
            }
        });
    }

    const locationFormContent = document.getElementById('location-form-content');
    if (locationFormContent) {
        locationFormContent.addEventListener('submit', function(e) {
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
                if (method === 'POST') {
                    addMarker({id: result.id, ...data});
                } else {
                    map.removeLayer(markers[id]);
                    addMarker({id, ...data});
                }
                locationForm.classList.add('hidden');
                if (currentMarker) {
                    map.removeLayer(currentMarker);
                    currentMarker = null;
                }
                locationFormContent.reset();
                document.getElementById('location-id').value = '';
            });
        });
    }
}

function editLocation(id) {
    const marker = markers[id];
    const latLng = marker.getLatLng();
    document.getElementById('location-id').value = id;
    document.getElementById('latitude').value = latLng.lat.toFixed(6);
    document.getElementById('longitude').value = latLng.lng.toFixed(6);
    
    fetch(`/api/locations/${id}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('name').value = data.name;
            document.getElementById('address').value = data.address;
            document.getElementById('location-form').classList.remove('hidden');
        });
    
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    currentMarker = marker;
    map.setView(latLng, 15);
}

function deleteLocation(id) {
    if (confirm('Are you sure you want to delete this location?')) {
        fetch(`/api/locations/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                map.removeLayer(markers[id]);
                delete markers[id];
            });
    }
}

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

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    initMap();
});
