# Part 3 วาดแผนที่รถไฟฟ้าตามเวลา

ToDos: add video example

ในการวาดแผนที่ีถไฟฟ้าตามปีที่สร้าง มีไอเดียคร่าวๆ ดังนี้

- สร้าง `state` สำหรับปีที่จะแสดงแผนที่รถไฟฟ้าถึง `mapYear`

- ใช้ `mapYear` เทียบกับแต่ละสายว่าจะต้องวาดสายรถไฟฟ้านั้น ๆ หรือยัง

- ในการ `animate` เส้นจะใช้ `CSS animation` ในการขยับ `strok-dasharray` ของ `path` element

- โดยใช้ `easing` เป็น `linear` เพื่อให้ง่ายต่อการเชื่อมกันของการ `animate` เส้น กับ สถานี

- คำนวณเวลาที่จะต้องเริ่มแสดงจุดจากสัดส่วนของระยะทางระหว่างความยาวของเส้น กับ ความยาวของจุดเริ่มต้นของสถานีถึงสถานีปัจจุบัน

- แสดงจุดเมื่อเวลาผ่านไปตามที่คำนวณได้ ด้วยการ set delay โดย `animation-delay`

## สร้าง `state` สำหรับปีที่จะแสดงแผนที่รถไฟฟ้าถึง `mapYear`

สร้าง `mapYear` และส่งไปที่ `<Mapbox ... mapYear={mapYear} />` component และสร้างฟังก์ชั่น `animateMap` สำหรับค่อยๆ เพิ่มปีไปตามปีที่รถไฟฟ้าเปิดให้ใช้บริการ ด้วยการหา `unique` จากปีที่สายของรถไฟฟ้าสร้างเสร็จทั้งหมดแล้วนำมา `sort` หลังจากนั้นเรียกใช้ฟังก์ชั่นต่อๆ กันด้วย `queueCall` ที่ใช้ในการขยับแผนที่ตามเส้นทางรถไฟฟ้าใน `part2`

```javascript
// src/App.js
...
function App() {
  const [mapYear, setMapYear] = useState(2563);
  ...

  function animateMap() {
    const allYear = geodata.line.features.map(
      (feature) => feature.properties.end
    );
    const unique = [...new Set(allYear)].sort();

    const queue = unique.map((year) => ({
      movemap: () => setMapYear(year),
      t: 1750,
    }));
    queueCall(queue);
  }
  ...
  return (
    ...
     <div className="controller">
        <h2>แสดงแผนที่ถึงปี {mapYear}</h2>
        <button onClick={animateMap}>Animate Map</button>
        <button onClick={AriToSilom}>Ari to Silom</button>
    </div>
    <Mapbox geodata={geodata} mapYear={mapYear}>
    ...
  )
}
```

```javascript
// src/components/trainLine.js
import { useLayoutEffect, useRef, useState } from "react";

export default function TrainLine(props) {
  const { feature, path, mapYear } = props;

  const ref = useRef(null);
  const [length, setLength] = useState(0);
  useLayoutEffect(() => {
    setLength(ref.current.getTotalLength());
  }, [ref]);

  const { stroke, end } = feature.properties;

  const definition = path(feature);

  return (
    <g className="line">
      {mapYear >= end && (
        <path
          ref={ref}
          class={"animate"}
          d={definition}
          fill="transparent"
          stroke={stroke}
          strokeWidth={3}
          strokeDasharray={length}
          strokeDashoffset={length}
        />
      )}
      <style jsx>{`
        .animate {
          animation-name: dash;
          animation-duration: 1.5s;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </g>
  );
}
```

```javascript
// src/components/trainStation.js
export default function TrainStation(props) {
  const { feature, projection, mapYear } = props;

  const {
    properties: { finish },
    geometry: { coordinates },
  } = feature;

  const [cx, cy] = projection(coordinates);

  return (
    <g className="station">
      {mapYear >= finish && <circle cx={cx} cy={cy} r={3} fill="white" />}
    </g>
  );
}
```

```javascript
// src/utils/lineStationRelationship.js
export default {
   {
    line: 101,
    station: ["BL13", "N1", "N2", "N3", "N4", "N5", "N6", "N7", "CEN"],
  },
  {
    line: 201,
    station: [
      "W1",
      "E1",
      "E2",
      "E3",
      "E4",
      "E5",
      "E6",
      "E7",
      "E8",
      "E9",
      "S1",
      "BL26",
      "S3",
      "S4",
      "S5",
      "S6",
    ],
  },
  ...
}
```

```javascript
// src/utils/findLineIDByStationCode.js
import lineStationRelationship from "./lineStationRelationship";

export default function findLineIDByStationCode(code) {
  for (const { line, station } of lineStationRelationship) {
    if (station.includes(code)) {
      return line;
    }
  }
}
```

```javascript
// src/components/d3map.js
...
export default function D3Map(props) {
  ...
  return (
    ...
  {geodata.station.features.map(function (feature) {
        let delay = 1;
        const lineID = findLineIDByStationCode(feature.properties.code);
        if (lineID) {
          const lineFeature = flatten(
            geodata.line.features.find(
              (feature) => +feature.properties.id === lineID
            )
          );

          if (lineFeature) {
            const nearestIdx = findNearestIdx(
              feature.geometry.coordinates,
              lineFeature.features[0].geometry.coordinates
            );
            const pathToStationLineString = {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: lineFeature.features[0].geometry.coordinates.slice(
                  0,
                  nearestIdx
                ),
              },
            };
            const pathToStationDistance = geoLength(pathToStationLineString);
            const totalDistance = geoLength(lineFeature.features[0]);
            delay = pathToStationDistance / totalDistance;
          }
        }

        return (
          <TrainStation
            key={feature.properties.code}
            mapYear={mapYear}
            feature={feature}
            projection={projection}
            delay={delay}
          />
        );
      })}
      ...
  )
}
```

```javascript
// src/components/trainStation.js
export default function TrainStation(props) {
  const { feature, projection, mapYear, delay } = props;

  const {
    properties: { finish },
    geometry: { coordinates },
  } = feature;

  const [x, y] = projection(coordinates);

  return (
    <g className="station" transform={`translate(${x}, ${y})`}>
      {mapYear >= finish && (
        <circle
          className="train-station"
          r={3}
          style={{
            animationDelay: `${delay * 1.5}s`,
          }}
          fill="white"
        />
      )}
      <style jsx>{`
        .train-station {
          animation-name: pop;
          animation-duration: 1s;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
          transform: scale(0, 0);
        }
        @keyframes pop {
          0% {
            transform: scale(0, 0);
          }
          20% {
            transform: scale(1.1, 1.1);
          }
          40% {
            transform: scale(0.98, 0.98);
          }
          60% {
            transform: scale(1.05, 1.05);
          }
          80% {
            transform: scale(1.01, 1.01);
          }
          100% {
            transform: scale(1, 1);
          }
        }
      `}</style>
    </g>
  );
}
```
