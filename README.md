<p align="center">
  <img width="200" src="https://github.com/liyuanqiu/leaflet-spots/raw/master/assets/logo.svg?sanitize=true">
</p>

### Introduce
> `leaflet-spots` is a paradigm and tool of rendering spots on a [leaflet](https://leafletjs.com/) map.

***Q: What is `spots`?***

A: Assume you have a list of realtime bus data, and you need to draw them on a map. Each bus will be drawn as a `spot`, then you can see them on map.

> Users just need to tell the `leaflet-spots` how to parse your metadata data, then `leaflet-spots` do the rest things for you.

***Q: What is `leaflet`?***

A: https://leafletjs.com/

---

### Quick Start
Assume you have a list of realtime bus data:
```json
[
  {
    "busId": "AL-001",
    "lat": 33.483249,
    "lng": -86.745463,
    "driverId": "ALBD-1935",
    "passenger": 21
  },
  {
    "busId": "CA-103",
    "lat": 37.776183,
    "lng": -122.421233,
    "driverId": "CABD-2297",
    "passenger": 43
  },
  ...
]
```
Now you want to render them on a [leaflet](https://leafletjs.com/) map.
```typescript
import LeafletSpots, {
  MetadataParser,
} from 'leaflet-spots';

import {
  latLng, LatLng,
  Map, Path,
} from 'leaflet';

// define your data structure
interface BusData {
  busId: string;
  lat: number;
  lng: number;
  driverId: string;
  passenger: number;
}

// Assume you have a leaflet map instance
const map: Map = ...;

// Assume you have a list of bus data
const busList: BusData[] = ...;

// Create instance of MetadataParser
const metadataParser = new MetadataParser<BusData>({
  // Tell me how to parse lat and lng from your data
  parseLatlng(busData): LatLng {
    return latLng(busData.lat, busData.lng);
  },
  // Tell me how to parse id from your data
  parseId(busData): string {
    return busData.busId;
  },
  // Tell me how to draw a shape according to your data
  parseShape(busData): Path {
    // Assume `createCircle` returns a Circle of leaflet
    return createCircle(busData);
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

// Assume some bus data changed
const changedBusList: BusData[] = ...;

// They are updated!
changedBusList.forEach(bus => leafletSpots.updateSpot(bus));
```

---

### Road Map
- [x] Support `Typescript`
- [ ] Support `Javascript`
- [ ] Testing
- [x] Logo
- [ ] User manual
  - [x] Introduce
  - [x] Quick Start
  - [ ] API Reference
- [ ] Demo page
- [ ] Public to NPM