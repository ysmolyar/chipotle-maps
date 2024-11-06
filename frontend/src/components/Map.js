import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import ClusterGroup from './ClusterGroup';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

// Import icon images
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Create a custom icon
const customIcon = new L.Icon({
    iconUrl: iconUrl,
    shadowUrl: iconShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function MapController({ center, locations, onMarkerClick, onRateLocation }) {
  const map = useMap();
  const markerClusterRef = useRef(null);
  
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);

  useEffect(() => {
    if (!map || !L.markerClusterGroup) return;

    if (markerClusterRef.current) {
      markerClusterRef.current.clearLayers();
      map.removeLayer(markerClusterRef.current);
    }

    markerClusterRef.current = L.markerClusterGroup();

    locations.forEach((location) => {
      const marker = L.marker([location.coordinates.lat, location.coordinates.lng], { icon: customIcon })
        .bindPopup(`
          <h3>${location.location}</h3>
          <p>${location.address}</p>
          <p>Rating: ${location.averageRating ? location.averageRating.toFixed(1) : 'N/A'}</p>
          <button onclick="window.handleRateLocation('${location._id}')">Rate This Location</button>
        `);
      markerClusterRef.current.addLayer(marker);
    });

    map.addLayer(markerClusterRef.current);

    return () => {
      if (markerClusterRef.current) {
        map.removeLayer(markerClusterRef.current);
      }
    };
  }, [map, locations, onMarkerClick, onRateLocation]);

  return null;
}

const Map = ({ locations, userLocation, onMarkerClick, onRateLocation, mapCenter }) => {
  const defaultCenter = [37.7749, -122.4194]; // Default to San Francisco

  // Add this to make the handleRateLocation function accessible globally
  window.handleRateLocation = onRateLocation;

  return (
    <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapController 
        center={mapCenter} 
        locations={locations}
        onMarkerClick={onMarkerClick}
        onRateLocation={onRateLocation}
      />
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={customIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default Map;
