import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useMap } from 'react-leaflet';

const ClusterLayer = ({ locations, customIcon, onMarkerClick, onRateLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const markers = L.markerClusterGroup();

    locations.forEach((location) => {
      const marker = L.marker([location.coordinates.lat, location.coordinates.lng], { icon: customIcon })
        .bindPopup(`
          <h3>${location.location}</h3>
          <p>${location.address}</p>
          <p>Rating: ${location.averageRating ? location.averageRating.toFixed(1) : 'N/A'}</p>
          <button class="rate-button" data-id="${location._id}">Rate Location</button>
        `);
      
      marker.on('click', () => onMarkerClick(location._id));
      markers.addLayer(marker);
    });

    map.addLayer(markers);

    map.on('popupopen', (e) => {
      const rateButton = document.querySelector('.rate-button');
      if (rateButton) {
        rateButton.addEventListener('click', () => {
          onRateLocation(rateButton.getAttribute('data-id'));
        });
      }
    });

    return () => {
      map.removeLayer(markers);
    };
  }, [map, locations, customIcon, onMarkerClick, onRateLocation]);

  return null;
};

export default ClusterLayer;
