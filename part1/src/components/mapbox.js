import React, { useEffect, useRef, useState } from 'react';

import mapboxgl from 'mapbox-gl';

import { BANGKOK_CENTER } from '../config';
const MAPSTYLE = 'mapbox://styles/mapbox/dark-v10';
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

let map;
export default function Mapbox(props) {
  const mapRef = useRef(null);
  const [dimension, setDimension] = useState({ width: 300, height: 150 });
  function resizeHandler() {
    if (!mapRef) return;
    const { width, height } = mapRef.current.getBoundingClientRect();
    setDimension({ width, height });
  }

  useEffect(() => {
    if (!mapRef) return;
    console.log('rendermap');
    map = new mapboxgl.Map({
      container: mapRef.current,
      style: MAPSTYLE,
      center: BANGKOK_CENTER,
      zoom: 10,
    });
    map.on('move', console.log);

    window.addEventListener('resize', resizeHandler);
  }, [mapRef]);

  return (
    <div className="train-map" style={{ width: '100%', height: '100%' }}>
      <div className="mapbox" ref={mapRef}></div>
    </div>
  );
}
