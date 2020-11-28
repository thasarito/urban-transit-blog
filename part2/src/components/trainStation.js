export default function TrainStation(props) {
  const {
    feature: {
      geometry: { coordinates },
    },
    projection,
  } = props;

  const [cx, cy] = projection(coordinates);

  return (
    <g className="station">
      <circle cx={cx} cy={cy} r={3} fill="white" />
    </g>
  );
}
