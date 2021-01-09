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
