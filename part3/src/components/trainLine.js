export default function TrainLine(props) {
  const { feature, path } = props;

  const { stroke } = feature.properties;

  const definition = path(feature);

  return (
    <g className="line">
      <path d={definition} fill="transparent" stroke={stroke} strokeWidth={3} />
    </g>
  );
}
