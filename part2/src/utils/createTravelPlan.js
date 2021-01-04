import distance from "@turf/distance";

const VELOCITY = 1.5e-3;
export default function createTravelPlan(paths, map) {
  const plan = paths.map((currentCoordinate, i, coordinates) => {
    const previousCoordinate = coordinates[i - 1];
    if (!previousCoordinate) return { fn: () => {}, t: 1 };

    const DISTANCE = distance(currentCoordinate, previousCoordinate),
      TIME = DISTANCE / VELOCITY;

    function movemap() {
      map.panTo(currentCoordinate, { duration: TIME, easing: (t) => t });
    }
    return {
      movemap,
      t: TIME,
    };
  });

  return plan;
}
