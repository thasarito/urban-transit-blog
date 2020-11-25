import React, { useEffect, useRef } from 'react';

import mapboxgl from 'mapbox-gl';

import { BANGKOK_CENTER } from '../config';
const MAPSTYLE = 'mapbox://styles/mapbox/dark-v10';
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

let map;
export default function Mapbox(props) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef) return;
    map = new mapboxgl.Map({
      container: mapRef.current,
      style: MAPSTYLE,
      center: BANGKOK_CENTER,
      zoom: 10,
    });
  }, [mapRef]);

  return (
    <div className="train-map">
      <div className="mapbox" ref={mapRef}></div>
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
