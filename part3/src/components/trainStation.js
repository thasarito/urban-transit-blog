export default function TrainStation(props) {
  const { feature, projection, mapYear, delay } = props;

  const {
    properties: { finish },
    geometry: { coordinates },
  } = feature;

  const [x, y] = projection(coordinates);

  return (
    <g className="station" transform={`translate(${x}, ${y})`}>
      {mapYear >= finish && (
        <circle
          className="train-station"
          r={3}
          style={{
            animationDelay: `${delay * 1.5}s`,
          }}
          fill="white"
        />
      )}
      <style jsx>{`
        .train-station {
          animation-name: pop;
          animation-duration: 1s;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
          transform: scale(0, 0);
        }
        @keyframes pop {
          0% {
            transform: scale(0, 0);
          }
          20% {
            transform: scale(1.1, 1.1);
          }
          40% {
            transform: scale(0.98, 0.98);
          }
          60% {
            transform: scale(1.05, 1.05);
          }
          80% {
            transform: scale(1.01, 1.01);
          }
          100% {
            transform: scale(1, 1);
          }
        }
      `}</style>
    </g>
  );
}
