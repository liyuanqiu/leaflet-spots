import LeafletSpots, {
  MetadataParser,
} from 'leaflet-spots';

import {
  latLng, LatLng,
  map as createMap,
  tileLayer,
  Map, Layer,
  LatLngExpression,
  icon, marker,
} from 'leaflet';

const CENTER: LatLngExpression = [33.483249, -86.745463];
const MAX_PASSENGER = 50;
const TILE_TEMPLATE = 'https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i462170336!3m9!2szh-CN!3sUS!5e18!12m1!1e68!12m3!1e37!2m1!1ssmartmaps!4e0!5m1!5f2&key=AIzaSyDk4C4EBWgjuL1eBnJlu1J80WytEtSIags&token=79092';

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
  tileLayer(TILE_TEMPLATE).addTo(map);
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
  parseShape(busData: BusData): Layer {
    const busIcon = icon({
      iconUrl: 'bus.svg',
      iconSize: [30, 30],
    });
    return marker([busData.lat, busData.lng], {
      icon: busIcon,
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