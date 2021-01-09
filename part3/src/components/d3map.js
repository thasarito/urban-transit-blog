import { useMemo } from "react";

import { geoMercator, geoPath } from "d3-geo";
import TrainStation from "./trainStation";
import TrainLine from "./trainLine";

export default function D3Map(props) {
  const { geodata, dimension, viewport, mapYear } = props;

  const { projection, path, scaler } = useMemo(() => {
    const { latitude, longitude, zoom } = viewport;
    const scale = ((512 * 0.5) / Math.PI) * Math.pow(2, zoom);

    const projection = geoMercator()
      .center([longitude, latitude])
      .translate([dimension.width / 2, dimension.height / 2])
      .scale(scale);

    const path = geoPath(projection);

    const scaler = Math.min(scale / 83443, 3);
    return { projection, path, scaler };
  }, [dimension, viewport]);

  return (
    <svg>
      {geodata.line.features.map(function (feature) {
        return (
          <TrainLine
            key={feature.properties.id}
            mapYear={mapYear}
            feature={feature}
            path={path}
          />
        );
      })}
      {geodata.station.features.map(function (feature) {
        return (
          <TrainStation
            key={feature.properties.code}
            mapYear={mapYear}
            feature={feature}
            projection={projection}
          />
        );
      })}
      <style jsx>{`
        svg {
          width: ${dimension.width}px;
          height: ${dimension.height}px;
          pointer-events: none;
          position: absolute;
          top: 0;
          left: 0;
        }
      `}</style>
    </svg>
  );
}
