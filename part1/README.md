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

สร้าง dimension state และ eventlistener สำหรับอัพเดททุกครั้งเมื่อ resize แล้ว resizeHandler 1 ครั้งเพื่ออัพเดท `width` และ `height`

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
    resizeHandler()
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

#### Create Projection Function

หลังจากนั้น install package d3-geo

`npm i --save d3-geo`

โดย Projection ที่ mapbox ใช้ คือ [geoMercator](https://docs.mapbox.com/help/glossary/projection/) ซึ่ง `d3js` มี Projection นี้มาให้ และเราจะอัพเดท projection นี้ทุกครั้งที่ `viewport` หรือ `dimension` เปลี่ยนด้วย `useMemo` hook

_TODO: อธิบายความเชื่อมโยงของ Mapbox's zoom กับ projection.scale()_

```javascript
const { projection, path, scaler } = useMemo(() => {
  const { latitude, longitude, zoom } = viewport;
  const scale = ((512 * 0.5) / Math.PI) * Math.pow(2, zoom);

  const projection = geoMercator()
    .center([longitude, latitude])
    .translate([dimension.width / 2, dimension.height / 2])
    .scale(scale);

  const path = geoPath(projection);

  const scaler = Math.min(scale / 83443, 3);
  return { projection, path, scaler };
}, [dimension, viewport]);
```

#### Introducing GeoJSON

GeoJSON เป็นมาตรฐานการเก็บข้อมูล geographical รูปแบบหนึ่งใน JSON format โดยในไฟล์ GeoJSON จะเก็บข้อมูลไว้เป็น Collection ของ Feature ต่างๆ ใน features

```json
{
  "type": "FeatureCollection",
  "name": "bkk_subway",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "stroke": "#9BAE24",
        "stroke-width": 2,
        "id": "100",
        "brand": "BTS",
        "line": "สุขุมวิท",
        "name": "รถไฟฟ้าบีทีเอส สายสุขุมวิท (สยาม → หมอชิต)",
        "type": "route",
        "start": 2535,
        "end": 2542,
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [100.53423195737791, 13.745683374751117],
          ...,
          [100.55491895331066, 13.804474442914579]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "brand": "ARL",
        "line": "แอร์พอร์ต เรล ลิงก์ ",
        "name": null,
        "type": null,
        "start": 2549,
        "end": null,
        "station": "มักกะสัน",
        "code": "A6",
        "finish": 2553,
        "district": "ราชเทวี",
      },
      "geometry": {
        "type": "Point",
        "coordinates": [100.56360289203926, 13.750432806958651]
      }
    }
  ]
}
```

โดยในแต่ละ Feature จะมี 2 properties หลัก คือ

1. `properties` ไว้สำหรับเก็บข้อมูลต่างๆ ของ Feature นั้นๆ เช่น ชื่อสถานี

2. `geometry` ไว้สำหรับเก็บข้อมูล geographical ของ Feature นั้น มีได้หลายชนิด โดยที่เราจะใช้มี 2 แบบ คือ `LineString` สำหรับสายรถไฟแต่ละสาย และ `Point` สำหรับตำแหน่งของสถานี

#### Request GeoJSON file

ต่อมาเราจะ request ไฟล์แผนที่ GeoJSON มา ด้วย `d3-request`

`npm i --save d3-request`

โดยเราจะเก็บ file GeoJSON ไว้ใน state และใช้ `useEffect` ในการเรียก `jsonRequest` เมื่อ Component render เป็นครั้งแรก

หลังจากนั้นเนื่องจากในไฟล์ GeoJSON นี้มีทั้งเส้นทางเดินรถไฟ และสถานี เราจะแยกทั้งสองออกจากกัน ด้วยฟังก์ชั่น filterGeoJSON

หลังจากนั้นก็ส่ง `geodata` เป็น props ผ่านไปให้ `<Mapbox geodata={geodata} />`

```javascript
import { useEffect, useState } from 'react';

import { json as jsonRequest } from 'd3-request';

import Mapbox from './components/mapbox';
import filterGeojson from './utils/filterGeojson';

function App() {
  const [geodata, setGeodata] = useState({ features: [] });
  useEffect(() => {
    jsonRequest('/data/map.geo.json', function (response) {
      const data = {};
      data.station = filterGeojson(
        response,
        (feature) => feature.geometry.type === 'Point'
      );

      data.line = filterGeojson(response, (feature) =>
        feature.geometry.type.includes('LineString')
      );
      setGeodata(data);
    });
  }, []);
...
}
```

```javascript
# utils/filterGeojson.js
export default function filterGeojson(geojson, filter) {
  return {
    type: "FeatureCollection",
    features: geojson.features.filter(filter),
  };
}
```

#### Using Projection to draw Map from GeoJSON

ต่อมาเราจะใช้ `projection` ที่ได้มาแปลงข้อมูล geographical เป็นตำแหน่ง pixel บนหน้าจอที่เชื่อมกับตำแหน่ง geographical นั้นๆ ใน Mapbox

เริ่มจากสร้างไฟล์ Component `D3map` โดยจะรับ props 3 อย่าง คือ `geodata`, `dimension` และ `viewport`

```javascript
function Mapbox() {
  ...

  return (
    ...
    <D3Map geodata={geodata} dimension={dimension} viewport={viewport} />
    ...
  )
}
```

```javascript
import { useMemo } from 'react';

import { geoMercator, geoPath } from 'd3-geo';

export default function D3Map(props) {
  const { geodata, dimension, viewport } = props;

  const { projection, path, scaler } = useMemo(() => {
    const { latitude, longitude, zoom } = viewport;
    const scale = ((512 * 0.5) / Math.PI) * Math.pow(2, zoom);

    const projection = geoMercator()
      .center([longitude, latitude])
      .translate([dimension.width / 2, dimension.height / 2])
      .scale(scale);

    const path = geoPath(projection);

    const scaler = Math.min(scale / 83443, 3);
    return { projection, path, scaler };
  }, [dimension, viewport]);

  return (
    <svg>
      <style jsx>{`
        svg {
          width: ${dimension.width}px;
          height: ${dimension.height}px;
          pointer-events: none;
          position: absolute;
          top: 0;
          left: 0;
        }
      `}</style>
    </svg>
  );
}
```

#### Drawing Station

โดยในการวาดแต่ละสถานีลงไปบนแผนที่ เราจะใช้ข้อมูลจากใน `geodata.station` ที่เตรียมไว้ ส่งไปให้ Component ใหม่ชื่อ `trainStation`

โดย Component นี้จะรับ feature ของแต่ละสถานีใน `geodata.station` และ `projection` สำหรับแปลงข้อมูล geographical ใน feature เป็นตำแหน่งบนหน้าจอสำหรับ render

```json
// ตัวอย่าง feature ที่จะส่งไปให้ Component trainStation
{
  "type": "Feature",
  "properties": {
    "stroke": null,
    "stroke-width": null,
    "id": null,
    "brand": "ARL",
    "line": "แอร์พอร์ต เรล ลิงก์ ",
    "name": null,
    "type": null,
    "start": 2549,
    "end": null,
    "station": "บ้านทับช้าง",
    "code": "A3",
    "lng": 100.6908112,
    "lat": 13.7329138,
    "finish": 2553,
    "district": "ประเวศ",
    "zone": "ดำรงชีวิต",
    "street": "ถนนคู่ขนานกรุงเทพฯ-ชลบุรี",
    "51-54_min": "ไม่มีข้อมูล",
    "51-54_max": "ไม่มีข้อมูล",
    "55-58_min": "30,000",
    "55-58_max": "30,000",
    "59-62_min": "20,000",
    "59-62_max": "32,000"
  },
  "geometry": { "type": "Point", "coordinates": [100.6908112, 13.7329138] }
}
```

เริ่มจาก destructure `coordinates` ออกมาจาก `props` ที่รับมา แล้วส่ง coorinates นั้นไปให้ `projection` ซึ่งจะ `return` ตำแหน่งศูนย์กลางของสถานีนั้นๆ มาให้ `[cx, cy]` หลังจากนั้นก็นำตำแหน่งนั้นไปวาดวงกลมลงบน svg

```javascript
// src/components/trainStation.js
export default function TrainStation(props) {
  const {
    feature: {
      geometry: { coordinates },
    },
    projection,
  } = props;

  const [cx, cy] = projection(coordinates);

  return (
    <g className="station">
      <circle cx={cx} cy={cy} r={3} fill="white" />
    </g>
  );
}
```

#### Drawing Train Line

คล้ายกันกรณีจุด การวาดเส้นเราจะใช้ฟังก์ชั่น `path` ที่ได้มาจากฟังก์ชั่น [`geoPath`](https://github.com/d3/d3-geo#paths) ซึ่งเป็น factory function ที่สร้างฟังก์ชั่นที่รับ `feature` แล้วสร้าง `definition` ของ svg `<path />` จาก `projection` ที่ได้รับ

```javascript
// src/components/trainLine.js

export default function TrainLine(props) {
  const { feature, path } = props;

  const { stroke } = feature.properties;

  const definition = path(feature);

  return (
    <g className="line">
      <path d={definition} fill="transparent" stroke={stroke} strokeWidth={3} />
    </g>
  );
}
```

![Part 1 Result](./part1_result.png)
