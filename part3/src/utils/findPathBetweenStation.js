import findNearestIdx from "./findNearestIdx";
import nameToCoords from "./nameToCoords";

export default function findPathBetweenStation(directions, station, line) {
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
}
