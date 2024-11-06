import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import 'leaflet.markercluster';

const ClusterGroup = ({ children }) => {
  const map = useMap();

  useEffect(() => {
    const cluster = L.markerClusterGroup();
    map.addLayer(cluster);

    children.forEach((child) => {
      if (child.type.name === 'Marker') {
        const marker = L.marker(child.props.position, child.props);
        if (child.props.popup) {
          marker.bindPopup(child.props.popup);
        }
        cluster.addLayer(marker);
      }
    });

    return () => {
      map.removeLayer(cluster);
    };
  }, [map, children]);

  return null;
};

export default ClusterGroup;
