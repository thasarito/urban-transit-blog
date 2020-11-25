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

โดยจะให้ render หลังจากที่ได้ `mapRef` มาแล้ว หลังจากนั้นจัด style ให้ Mapbox ขยายเต็ม viewport

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

### Adding D3js

หลังจากนั้นเราจะใช้ `d3js` ในการวาดเส้นทางเดินรถไฟฟ้า และจุดตามสถานีต่างๆ ซึ่งการจะทำให้ Mapbox และ d3js สามารถแสดงผลแผนที่ให้สอดคล้องกันได้นั้น เราต้องทำให้ `d3js` รู้ถึง state ณ ปัจจุบันของ mapbox ดังนี้

1. `Dimension` ประกอบด้วย width และ height ของ `mapRef`

2. `Viewport` ประกอบด้วย latitude, longitude, และ zoom

หลังจากนั้นเราจะใช้ 2 state นี้เป็น parameter การสร้าง `projection` สำหรับการวาดจุดสถานี และแผนที่

#### Dimension State

สร้าง dimension state และ eventlistener สำหรับอัพเดททุกครั้งเมื่อ resize

```javascript
  const [dimension, setDimension] = useState({ width: 300, height: 150 });
  function resizeHandler() {
    if (!mapRef) return;
    const { width, height } = mapRef.current.getBoundingClientRect();
    setDimension({ width, height });
  }
  ...
  useEffect(() => {
    ...
    window.addEventListener('resize', resizeHandler);
  }, [mapRef]);
```

#### Viewport State

สร้าง Viewport State และส่งเป็น callback function ให้อัพเดททุกครั้งเมื่อ mapbox ขยับ และปิดฟังก์ชันหมุนแผนที่

```javascript
...
  const [viewport, setViewport] = useState({
    longitude: BANGKOK_CENTER[0],
    latitude: BANGKOK_CENTER[1],
    zoom: 10,
  });
  ...
useEffect(() => {
  ...
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

```
