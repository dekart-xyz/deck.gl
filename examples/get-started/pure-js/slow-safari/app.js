import {Deck} from '@deck.gl/core';
import {H3HexagonLayer} from '@deck.gl/geo-layers';
import mapboxgl from 'mapbox-gl';
import parse from 'csv-parse/lib/sync';
import Stats from 'stats.js';

const INITIAL_VIEW_STATE = {
  latitude: 52.52,
  longitude: 13.40,
  zoom: 10,
  bearing: 0,
  pitch: 30
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

const map = new mapboxgl.Map({
  container: 'map',
  style: MAP_STYLE,
  // Note: deck.gl will be in charge of interaction and event handling
  interactive: false,
  center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
  zoom: INITIAL_VIEW_STATE.zoom,
  bearing: INITIAL_VIEW_STATE.bearing,
  pitch: INITIAL_VIEW_STATE.pitch
});

// setup fps counter
const stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );
function animate() {
  stats.update();
  requestAnimationFrame( animate );
}
requestAnimationFrame( animate );


export const deck = new Deck({
  canvas: 'deck-canvas',
  width: '100%',
  height: '100%',
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  onViewStateChange: ({viewState}) => {
    map.jumpTo({
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      bearing: viewState.bearing,
      pitch: viewState.pitch
    });
  },
  layers: [
    new H3HexagonLayer({
      id: 'h3-hexagon-layer',
      data: (async ()=>{
        const res = await fetch('berlin-pop-density-22k.csv') // 22k rows, source https://www.worldpop.org/geodata/summary?id=44666
        if (res.ok) {
          const csv = await res.text()
          const data = parse(csv, {columns: true})
          return data;
        }
        return []
      })(),
      pickable: false,
      wireframe: false,
      filled: true,
      extruded: false,
      getHexagon: d => d.h3,
      getFillColor: d => [255, (1 - d.population / 5000) * 255, 0],
    })
  ]
});
