import LeafletSpots, {
  MetadataParser,
} from 'leaflet-spots';

import {
  latLng, LatLng,
  map as createMap,
  tileLayer,
  Map, Path,
  circleMarker,
  LatLngExpression,
  TileLayerOptions,
} from 'leaflet';

const CENTER: LatLngExpression = [33.483249, -86.745463];
const MAX_PASSENGER = 50;
const TILE_TEMPLATE = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

// define your data structure
interface BusData {
  busId: string;
  lat: number;
  lng: number;
  driverId: string;
  passenger: number;
}

// Create a leaflet map instance
const map: Map = ((): Map => {
  const map = createMap('map-container').setView(CENTER, 8);
  tileLayer(TILE_TEMPLATE, {
    maxZoom: 18,
    id: 'mapbox.streets'
  } as unknown as TileLayerOptions).addTo(map);
  return map;
})();

// You have a list of bus data
const busList: BusData[] = ((): BusData[] => {
  return Array(100).fill(1).map((item, index): BusData => ({
    busId: `B-${index}`,
    driverId: `D-${index}`,
    lat: CENTER[0] - 1 + Math.random() * 2,
    lng: CENTER[1] - 1 + Math.random() * 2,
    passenger: Math.round(Math.random() * MAX_PASSENGER),
  }));
})();

// Create instance of MetadataParser
const metadataParser = new MetadataParser<BusData>({
  // Tell me how to parse lat and lng from your data
  parseLatlng(busData: BusData): LatLng {
    return latLng(busData.lat, busData.lng);
  },
  // Tell me how to parse id from your data
  parseId(busData: BusData): string {
    return busData.busId;
  },
  // Tell me how to draw a shape according to your data
  parseShape(busData: BusData): Path {
    return circleMarker(latLng(busData.lat, busData.lng), {
      color: `hsla(${360 / MAX_PASSENGER * busData.passenger}, 100%, 50%, 1)`,
      radius: 5,
    });
  },
});

// Create instance of LeafletSpots
const leafletSpots = new LeafletSpots<BusData>({
  metadataParser,
});

// Add the layer to map
leafletSpots.getLayer().addTo(map);

// You can see them in your map!
leafletSpots.setSpots(busList);