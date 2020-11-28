export default function filterGeojson(geojson, filter) {
  return {
    type: 'FeatureCollection',
    features: geojson.features.filter(filter),
  };
}
