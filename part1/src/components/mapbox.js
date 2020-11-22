import { useEffect, useRef } from 'react';

import mapboxgl from 'mapbox-gl';

export default function Mapbox(props) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef) {
      new mapboxgl.Map({
        container: mapRef.current,
      });
    }
  }, [mapRef]);

  return <div className="mapbox" ref={mapRef}></div>;
}
