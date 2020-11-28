import React, { useEffect, useRef, useState } from 'react';

import mapboxgl from 'mapbox-gl';

import { BANGKOK_CENTER } from '../config';
import D3Map from './d3map';
const MAPSTYLE = 'mapbox://styles/mapbox/dark-v10';
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

let map;
export default function Mapbox(props) {
  const { geodata } = props;
  const mapRef = useRef(null);
  const [viewport, setViewport] = useState({
    longitude: BANGKOK_CENTER[0],
    latitude: BANGKOK_CENTER[1],
    zoom: 10,
  });

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

    resizeHandler();
    window.addEventListener('resize', resizeHandler);

    map.on('move', () => {
      const { lng: longitude, lat: latitude } = map.getCenter();
      const zoom = map.getZoom();

      const newViewport = { latitude, longitude, zoom };
      setViewport((prev) => ({ ...prev, ...newViewport }));
    });
    // disable map rotation using right click + drag
    map.dragRotate.disable();

    // disable map rotation using touch rotation gesture
    map.touchZoomRotate.disableRotation();
  }, [mapRef]);

  return (
    <div className="train-map">
      <div className="mapbox" ref={mapRef}>
        <D3Map geodata={geodata} dimension={dimension} viewport={viewport} />
      </div>
      <style jsx>{`
        .train-map {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .mapbox {
          position: relative;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}
