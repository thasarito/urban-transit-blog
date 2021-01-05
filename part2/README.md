# Part 2 Moving between Station along Train track

เริ่มจากสร้างปุ่มใน `App.js` สำหรับขยับจากสถานี `Ari` ไปสู่ `Silom`

```javascript
// src/App.js
...
function App() {
  ...
  function AriToSilom() {}
  ...
  <div className="App">
    <div className="controller">
      <button onClick={AriToSilom}>Ari to Silom</button>
    </div>
    ...
  </div>
...
}
```

## 2.1 สร้างฟังก์ชั่นสำหรับสร้างเส้นทางเพื่อขยับกล้อง

ในการขยับกล้องระหว่างสถานีหนึ่งไปอีกสถานีหนึ่ง สมมติเราต้องการจะขยับจากสถานี `stationA` ไปสถานีปลายทางที่ `stationC`

ถ้าเราไม่ต้องการที่จะขยับระหว่างจุดของสถานี `stationA` ไป `stationC` เลย ในบางกรณีอาจจะต้องมีการเปลี่ยนสายระหว่างทางที่สถานี `stationB` เราจึงจะเก็บข้อมูลไว้ว่าต้องเดินทางอย่างไรในรูปแบบของ `Array` ที่มี `Object` ที่มี property ดังนี้

1. `from` : เก็บ id ของสถานีเริ่มต้น
2. `to` : เก็บ id ของสถานีปลายทาง
3. `line` : เก็บ id ของเส้นทางเดินรถระหว่าง 2 สถานีข้างต้น

```javascript
// src/App.js
...

const SIAM = 'CEN',
  ARI = 'N5',
  SALADAENG = 'S2';

const SUKHUMVIT0 = '100',
  SILOMLINE1 = '201';
function App() {
  ...
  function AriToSilom() {
      const tracks = [
        {
          from: ARI,
          to: SIAM,
          line: SUKHUMVIT0,
        },
        {
          from: SIAM,
          to: SALADAENG,
          line: SILOMLINE1,
        },
      ];
  }
  ...
}
```

![line-station-relationship](./line-station.jpg)

เริ่มจากสร้างฟังก์ชั่นที่เปลี่ยนจาก `tracks` เป็น จุดบนเส้นทางรถไฟที่เชื่อมระหว่าง `stationA` กับ `stationC`

1. แปลง `from`, `to`, และ `line` ในแต่ละ `track` ให้เป็น coordinates

```javascript
// src/utils/nameToCoords.js
import flatten from "@turf/flatten";

export default function nameToCoords(directionsName, station, trainline) {
  /*
  [
    {
      from: Ari,
      to: Siam,
      line: 101
    }
  ]
  */
  const direction = directionsName.map((direction) => {
    const { from, to, line } = direction;

    const {
      geometry: { coordinates: fromCoord },
    } = station.features.find(({ properties: { code } }) => code === from);
    const {
      geometry: { coordinates: toCoord },
    } = station.features.find(({ properties: { code } }) => code === to);
    const {
      features: [
        {
          geometry: { coordinates: lineCoord },
        },
      ],
    } = flatten(
      trainline.features.find(({ properties: { id } }) => id === line)
    );

    return { from: fromCoord, to: toCoord, line: lineCoord };
  });

  return direction;
}

// src/App.js
const tracks = nameToCoords(
  [
    {
      from: ARI,
      to: SIAM,
      line: SUKHUMVIT0,
    },
    {
      from: SIAM,
      to: SALADAENG,
      line: SILOMLINE1,
    },
  ],
  geodata.station,
  geodata.line
);
```

2. สร้างฟังก์ชั่นเพื่อแปลง `track` ให้กลายเป็นเส้นทางด้วยขั้นตอนไปนี้

   1. หา index (`indexA`) ที่ใกล้ที่สุดของสถานี `from` กับจุดต่างๆ ใน `line`
   2. หา index (`indexB`) ที่ใกล้ที่สุดของสถานี `to` กับจุดต่างๆ ใน `line`
   3. คืน `Array` ที่เป็นจุดระหว่าง `indexA` และ `indexB`

3. รวม `path` ที่ได้มาจาก แต่ละ `track` เป็นเส้นเดียวกันด้วย `Array.reduce`

```javascript
// src/utils/findPathBetweenStation.js
import findNearestIdx from "./findNearestIdx";
import nameToCoords from "./nameToCoords";

export default (station, line) =>
  function findPathBetweenStation(directions) {
    /*
  directions = [
    {
      from: [lat, lon], of Ari Station
      to: [lat, lon], of Siam Station
      line: [[lat, lon], ...] (geometry of BTS Green)
    },
    {
      from: Siam,
      to: Silom,
      line: [[lat, lon], ...]
    },
  ]
  */
    const d = nameToCoords(directions, station, line);
    const paths = d.reduce((paths, direction) => {
      const { from, to, line } = direction;

      const fromIdx = findNearestIdx(from, line),
        toIdx = findNearestIdx(to, line);

      let path = line.slice(fromIdx, toIdx);

      if (fromIdx > toIdx) {
        const flip = [...line].reverse();
        path = flip.slice(line.length - fromIdx, line.length - toIdx);
      }
      path[0] = from;
      path[path.length - 1] = to;

      return [...paths, ...path];
    }, []);

    return paths;
  };
```

## 2.2 หาระยะทางระหว่างจุดที่ต่อกัน แล้วคำนวณเวลา

เพื่อให้กล้องขยับด้วยความเร็วคงที่ เราจะตั้งตัวแปร `VELOCITY` ขึ้นมาเป็นค่าคงที่ แล้วเอาระยะทางของจุดที่ต่อกัน `DISTANCE` มาหาเวลาที่ `TIME (t)` ที่ต้องใช้ในการขยับกล้องแต่ละครั้ง

```javascript
// src/utils/createTravelPlan.js

const VELOCITY = 1.5e-3;
function createTravelPlan(paths) {
  const plan = paths.map((currentCoordinate, i, coordinates) => {
    const previousCoordinate = coordinates[i - 1];
    if (!previousCoordinates) return { fn: () => {}, t: 1 };

    const DISTANCE = distance(currentCoordinates, previousCoordinate),
      TIME = DISTANCE / VELOCITY;

    function movemap() {
      map.panTo(coordinate, { duration: TIME, easing: (t) => t });
    }
    return {
      movemap,
      t: time,
    };
  });
}
```

## 2.3 สร้างฟังก์ชั่นสำหรับเรียกหลายๆ ฟังก์ชั่นต่อๆ กัน

ในส่วนของการขยับกล้องของ mapbox จะใช้ฟังก์ชั่น `panTo` ซึ่งจะสามารถขยับกล้องได้แค่จากจุดหนึ่งไปอีกจุดหนึ่งเท่านั้นใน 1 eventloop แต่เนื่องจากเราต้องการขยับตามเส้นทางเดินรถ ซึ่งจำนวนครั้งในการเรียกฟังก์ชั่นจะขึ้นอยู่กับจำนวนจุดในเส้นทางเดินรถระหว่างสถานีสองสถานี

จึงจะสร้างฟังก์ชั่นชื่อ `queueCall` ที่รับ
