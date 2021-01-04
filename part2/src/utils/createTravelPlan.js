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