export default function TrainLine(props) {
  const { feature, path, mapYear } = props;

  const { stroke, end } = feature.properties;

  const definition = path(feature);

  return (
    <g className="line">
      {mapYear >= end && (
        <path
          d={definition}
          fill="transparent"
          stroke={stroke}
          strokeWidth={3}
        />
      )}
    </g>
  );
}
