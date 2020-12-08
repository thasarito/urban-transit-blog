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
      console.log(data);
      setGeodata(data);
    });
  }, []);

  function AriToSilom() {}

  return (
    <div className="App">
      <div className="controller">
        <button onClick={AriToSilom}>Ari to Silom</button>
      </div>
      <Mapbox geodata={geodata} />
      <style jsx>{`
        .App {
          width: 100vw;
          height: 100vh;
          position: relative;
        }

        .controller {
          position: fixed;
          top: 2rem;
          left: 2rem;
          z-index: 100;
          -webkit-backdrop-filter: contrast(0.9);
          backdrop-filter: contrast(0.9);
          width: 30rem;
          height: 10rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .controller button {
          outline: none;
          padding: 1rem 2rem;
          background: lightseagreen;
          border: 1px solid white;
          color: white;
        }
      `}</style>
    </div>
  );
}

export default App;
