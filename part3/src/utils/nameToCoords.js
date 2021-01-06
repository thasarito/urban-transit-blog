import flatten from '@turf/flatten';

export default function nameToCoords(directionsName, station, trainline) {
  /*
  [
    {
      from: Ari,
      to: Siam,
      line: 101
    }
  ]
  */
  const direction = directionsName.map((direction) => {
    const { from, to, line } = direction;

    const {
      geometry: { coordinates: fromCoord },
    } = station.features.find(({ properties: { code } }) => code === from);
    const {
      geometry: { coordinates: toCoord },
    } = station.features.find(({ properties: { code } }) => code === to);
    const {
      features: [
        {
          geometry: { coordinates: lineCoord },
        },
      ],
    } = flatten(
      trainline.features.find(({ properties: { id } }) => id === line)
    );

    return { from: fromCoord, to: toCoord, line: lineCoord };
  });

  return direction;
}
