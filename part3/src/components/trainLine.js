import { useLayoutEffect, useRef, useState } from "react";

export default function TrainLine(props) {
  const { feature, path, mapYear } = props;

  const ref = useRef(null);
  const [length, setLength] = useState(0);
  useLayoutEffect(() => {
    setLength(ref.current.getTotalLength());
  }, [ref]);

  const { stroke, end } = feature.properties;

  const definition = path(feature);

  return (
    <g className="line">
      {mapYear >= end && (
        <path
          ref={ref}
          class={"animate"}
          d={definition}
          fill="transparent"
          stroke={stroke}
          strokeWidth={3}
          strokeDasharray={length}
          strokeDashoffset={length}
        />
      )}
      <style jsx>{`
        .animate {
          animation-name: dash;
          animation-duration: 1.5s;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </g>
  );
}
