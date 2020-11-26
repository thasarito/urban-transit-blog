import { useEffect, useState } from 'react';

import { json as jsonRequest } from 'd3-request';

import Mapbox from './components/mapbox';
import filterGeojson from './utils/filterGeojson';

function App() {
  const [geodata, setGeodata] = useState({
    station: { features: [] },
    line: { features: [] },
  });
  useEffect(() => {
    jsonRequest('/data/map.geo.json', function (response) {
      const data = {};
      data.station = filterGeojson(
        response,
        (feature) => feature.geometry.type === 'Point'
      );

      data.line = filterGeojson(response, (feature) =>
        feature.geometry.type.includes('LineString')
      );
      setGeodata(data);
    });
  }, []);

  return (
    <div className="App">
      <Mapbox geodata={geodata} />
      <style jsx>{`
        .App {
          width: 100vw;
          height: 100vh;
        }
      `}</style>
    </div>
  );
}

export default App;
