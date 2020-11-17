# Urban Transit Blog

Blog about making mapbox moving along train track and animate train map.

## Part I Setting up React + Mapbox + d3js

- ใช้ react เก็บ state ของ mapbox viewport 

- ใช้ viewport state ไปเป็น parameter ในการสร้าง projection ของ d3js

- Render แผนที่ด้วย jsx โดยใช้ projection ของ d3js ในการคำนวณ

### 1.1 เซตอัพ Mapbox ใน React

- Setup project ด้วย `npx create create-react-app`

- Install `npm i mapbox-gl`

- สร้าง Context

- สร้าง Component TrainMap

- ใช้ useRef ในการเก็บ reference ของ Element ที่จะใช้ render mapbox

- สร้าง viewport state

- ใช้ Ref และ Viewport State ในการ render mapbox

- สร้าง event listener ให้เมื่อ mapbox ขยับ viewport state อัพเดท

- สร้าง `resizeHandler` ให้ mapbox responsive

### 1.2 เซตอัพ D3js จาก Viewport State

- อธิบายไฟล์ geojson คร่าวๆ

- Install `d3-geo`

- สร้าง `projection` โดยใช้ `geoMercator` (เพราะ mapbox ใช้ projection นี้)

- Projection.scale vs mapbox zoom

- Projection สำหรับแปลง coordinate -> pixel

- สร้าง `geoPath` สำหรับวาดเส้นแปลง geojson feature เป็น path definition

- สร้าง Scaler สำหรับย่อขยายสิ่งอื่นๆ ที่ไม่เกี่ยวกับ geo เวลา zoom

- คำนวณสิ่งต่างๆ ใน `useMemo` ที่ อัพเดทเมื่อ `dimension` และ `viewport` เปลี่ยน

## Part II Moving between station

- ขยับ mapbox ระหว่างสถานี

- หา index จุดที่ใกล้ที่สุดกับเส้นของทั้งสองสถานี

- Slice เส้นตาม index ที่ได้มา

- คำนวณระยะทางระหว่างจุดในเส้น

- สร้าง `function queueCall` เรียกฟังก์ชั่นต่อๆ กัน

- เรียกฟังก์ชั่นต่อๆ กัน โดย set เวลาตามระยะทาง

### 2.1 ขยับจากสถานีไปอีกสถานี

- สร้างฟังก์ชั่นหา coordinate จาก code ของสถานี

- ใช้ mapbox panto ในการขยับจากจุดสู่จุด

- เขียน slidechangehandler และ function ที่รับ reverse, leave, rollback

### 2.2 ขยับจากสถานีไปอีกสถานีตามเส้น

- สมมติจะขยับจาก พญาไท ไปช่องนนทรี

- บอกเส้นที่จะวิ่ง และชื่อสถานี

```javascript
const Tracks = [{
	from: Phayathai,
	to: Siam,
	line: SUKHUMVIT0,
},
{
	from: Siam,
	to: Chong_Nonsi,
	line: Silom
}]
```


- ในแต่ละ Track ใน Array หยิบ features ของเส้นทาง (line) นั้นมา

- ใน coordinates หา index ที่ใกล้กับ from `fromidx` และ to `toidx` มากที่สุด

- สร้าง trackcoordinates ใหม่ด้วยการ slice coordinates นั้นแล้วเติม coordinates ของสถานีต้นทางและปลายทางเข้าไป `[from, ...coordinates.slice(fromidx, toidx), to]`

- คำนวณระยะทางระหว่าง (S) แต่ละ coordinate ใน `trackcoordinates` ด้วย `@turf/distance`

- กำหนด ความเร็ว (V) แล้ว คำนวณหาเวลาของแต่ละการ pan t = S/V

- หลังจากนั้นค่อยๆ pan ไปทีละ coordinate ใน trackcoordinates ด้วยการ `setTimeout` ตามเวลา (t)

## Part III Animating Train Map 

- หา idx ของจุดที่ใกล้ที่สุดระหว่างสถานีกับเส้น แล้วสร้าง newcoordinates เป็น `coordinates.slice(0, idx)`

- คำนวณความยาวระหว่างจุดเริ่มต้นของเส้น ไปถึงสถานี (ตอนนี้ใช้ DOM gettotallength อาจเปลี่ยนเป็น `@turf/length` หรือ `d3-geo` แทน)

- ใช้ระยะทางนั้น หารด้วยความยาวเส้นรวม

- ใช้ CSS animation ในการ animate เส้นโดยเซต timing function เป็น linear

- เซต animation duration ของจุดเป็นสัดส่วนที่คำนวณมา
