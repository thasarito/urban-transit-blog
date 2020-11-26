import { useMemo } from 'react';

import { geoMercator, geoPath } from 'd3-geo';

export default function D3Map(props) {
  const { dimension, viewport } = props;

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
      <style jsx>{`
        svg {
          width: ${dimension.width};
          height: ${dimension.height};
          pointer-events: none;
        }
      `}</style>
    </svg>
  );
}
