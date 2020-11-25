# Part 1 Setting up React + Mapbox + d3js

## Getting Started

### Create React App

`npx create-react-app urban-transit`

สร้าง React Project จาก `create-react-app`

### Mapbox GL JS

ต่อมาติดตั้ง mapbox-gl library สำหรับ Javascript ที่ใช้ WebGL ในการ render แผนที่จาก Mapbox

`npm install mapbox-gl`

### Create Mapbox Component

หลังจากนั้นสร้าง component ใหม่ `src/components/mapbox.js` หลังจากนั้นสร้าง element ที่จะเป็น container ของ mapbox หลังจากนั้นสร้าง reference ด้วย `useRef` เพื่อส่งไปให้ `Mapbox GL JS` ใช้ render แผนที่จาก mapbox

โดยจะให้ render หลังจาก

```javascript
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
```
