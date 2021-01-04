import { minIndex } from "d3-array";
import distance from "@turf/distance";

export default function findNearestIdx(position, path) {
  /*
    path = [[lat, lon], ...]
    position = [lat, lon]
  */

  const dist_2 = path.map((routeCoord) => {
    return distance(position, routeCoord);
  });

  return minIndex(dist_2);
}
