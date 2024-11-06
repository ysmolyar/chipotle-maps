import { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function useMapReady() {
  const [isMapReady, setIsMapReady] = useState(false);
  const map = useMap();

  useEffect(() => {
    if (map) {
      setIsMapReady(true);
    }
  }, [map]);

  return isMapReady;
}
