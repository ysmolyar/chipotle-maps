console.log("map.js is being executed");

let map;
let markers = {};
let currentMarker;
let isAdmin = false;

const MIN_LOADING_TIME = 2000; // 2 seconds minimum loading time

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

    const mapElement = document.getElementById('map');
    const mapPlaceholder = document.getElementById('map-placeholder');
    if (!mapElement) {
        console.log('No map element found. Skipping map initialization.');
        return;
    }

    getUserLocation(location => {
        const defaultView = [39.8283, -98.5795]; // Center of USA
        const zoom = location ? 13 : 4;

        console.log("Creating map with view:", location || defaultView);
        map = L.map('map', {
            zoomControl: false
        }).setView(location || defaultView, zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Remove placeholder when map is fully loaded
        map.whenReady(() => {
            if (mapPlaceholder) {
                mapPlaceholder.style.display = 'none';
            }
        });

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
    });
}

function fetchLocations() {
    fetch('/api/locations')
        .then(response => response.json())
        .then(locations => {
            locations.forEach(location => addMarker(location));
        })
        .catch(error => {
            console.error("Error fetching locations:", error);
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
                    if (markers[id]) {
                        map.removeLayer(markers[id]);
                    }
                    addMarker({id, ...data});
                }
                locationForm.classList.add('hidden');
                if (currentMarker) {
                    map.removeLayer(currentMarker);
                    currentMarker = null;
                }
                locationFormContent.reset();
                document.getElementById('location-id').value = '';
            })
            .catch(error => {
                console.error("Error submitting location form:", error);
                alert("An error occurred while submitting the form.");
            });
        });
    }
}

function editLocation(id) {
    const marker = markers[id];
    if (!marker) {
        console.error(`Marker with ID ${id} not found.`);
        return;
    }
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
        })
        .catch(error => {
            console.error(`Error fetching location ${id}:`, error);
            alert("An error occurred while fetching the location details.");
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
                if (markers[id]) {
                    map.removeLayer(markers[id]);
                    delete markers[id];
                }
            })
            .catch(error => {
                console.error(`Error deleting location ${id}:`, error);
                alert("An error occurred while deleting the location.");
            });
    }
}

// Function to show location preview in modal
function showLocationPreview(location) {
    const modal = document.getElementById('locationModal');
    if (!modal) {
        console.error('locationModal element not found.');
        return;
    }
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
    const mapPreviewElement = document.getElementById('mapPreview');
    if (mapPreviewElement) {
        const mapPreview = L.map('mapPreview').setView([location.lat, location.lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapPreview);
        L.marker([location.lat, location.lng]).addTo(mapPreview);
    } else {
        console.warn('mapPreview element not found.');
    }

    // Show modal
    if (typeof $ !== 'undefined' && typeof $.fn.modal === 'function') {
        $('#locationModal').modal('show');
    } else {
        console.warn('jQuery or Bootstrap Modal is not loaded.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    initMap();
});
