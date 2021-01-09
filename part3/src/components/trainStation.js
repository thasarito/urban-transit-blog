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
