# Part 2 Moving between Station along Train track

ในการขยับกล้องระหว่างสถานีหนึ่งไปอีกสถานีหนึ่ง สมมติเราต้องการจะขยับจากสถานี `stationA` ไปสถานีปลายทางที่ `stationC`

ถ้าเราไม่ต้องการที่จะขยับระหว่างจุดของสถานี `stationA` ไป `stationC` เลย ในบางกรณีอาจจะต้องมีการเปลี่ยนสายระหว่างทางที่สถานี `stationB` เราจึงจะเก็บข้อมูลไว้ว่าต้องเดินทางอย่างไรในรูปแบบของ `Array` ที่มี `Object` ที่มี property ดังนี้

1. `from` : เก็บ id ของสถานีเริ่มต้น
2. `to` : เก็บ id ของสถานีปลายทาง
3. `line` : เก็บ id ของเส้นทางเดินรถระหว่าง 2 สถานีข้างต้น

```javascript
const routes = [
  {
    from: stationA,
    to: stationB,
    line: lineGreen,
  },
  {
    from: stationB,
    to: stationC,
    line: lineBlue,
  },
];
```

![line-station-relationship](./line-station.jpg)

ในส่วนของการขยับกล้องของ mapbox จะใช้ฟังก์ชั่น `panTo` ซึ่งจะสามารถขยับกล้องได้แค่จากจุดหนึ่งไปอีกจุดหนึ่งเท่านั้นใน 1 eventloop แต่เนื่องจากเราต้องการขยับตามเส้นทางเดินรถ ซึ่งจำนวนครั้งในการเรียกฟังก์ชั่นจะขึ้นอยู่กับจำนวนจุดในเส้นทางเดินรถระหว่างสถานีสองสถานี

1. หา index (`indexA`) ที่ใกล้ที่สุดของสถานี `from` กับจุดต่างๆ ใน `line`

2. หา index (`indexB`) ที่ใกล้ที่สุดของสถานี `to` กับจุดต่างๆ ใน `to`

3. คืน `Array` ที่เป็นจุดระหว่าง `indexA` และ `indexB`

```javascript
import findNearestIdx from './findNearestIdx';
import nameToCoords from './nameToCoords';

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
