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
import { useEffect, useRef } from 'react';

import mapboxgl from 'mapbox-gl';

export default function Mapbox(props) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef) {
      new mapboxgl.Map({
        container: mapRef.current,
        style: MAPSTYLE,
        center: BANGKOK_CENTER,
        zoom: 10,
      });
    }
  }, [mapRef]);

  return <div className="mapbox" ref={mapRef}></div>;
}
```
