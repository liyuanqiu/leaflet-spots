<p align="center">
  <img width="200" src="https://github.com/liyuanqiu/leaflet-spots/raw/master/assets/logo.svg?sanitize=true">
</p>

### Introduce
> `leaflet-spots` is a paradigm and tool of rendering spots on a [leaflet](https://leafletjs.com/) map.
---
### Motivation
I work with data visualization on maps. Here's some typical scenarios:
- Texi/bus realtime positioning
- IoT realtime positioning
- Satellites project on earth
- User distribution

Each of them(taxi, IoT, satellite projection, user) will be drawn on the map, I call them `spot`.
<img width="500" src="https://github.com/liyuanqiu/leaflet-spots/raw/master/assets/screenshot.png?sanitize=true">

Each project has an almost same logic, so I decide to singleton it out, try to make it becoming a common plugin of `leaflet`.

---

### Demo
https://liyuanqiu.github.io/leaflet-spots/demo/index.html

---

### Installation
```bash
yarn add leaflet-spots
// or
// npm install leaflet-spots
```

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
  Map, Layer,
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
  parseShape(busData): Layer {
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

### API Reference
```javascript
import LeafletSpots, {
  MetadataParser,
} from 'leaflet-spots';
```
# class LeafletSpots
### constructor
- Signature
	```javascript
	new LeafletSpots({
	  metadataParser,
	  spotEvents = {},
	  handleInteractive = () => {},
	})
	```
	- metadataParser
	  > Describe how to parse your data
	  
	  See: [Metadata Parser]()
	- spotEvents

	  > Attach events to each spot.
	  
	  Example:
		```javascript
		// this will attach `click` and `contextmenu` events to each spot.
		{
		  click(...args) {
		    console.log(args);
		  },
		  contextmenu(...args) {
		    console.log(args);
		  },
		}
		```
	- handleInteractive

	  > Handle some special interactive like `filter` and `select`
	  - Signature
	    ```typescript
	    interface InteractiveOptions {
		  filtered: boolean;
		  selected: boolean;
		}
	    type InteractiveHandler<T> = (
		  metadata: T,
		  shape: Layer,
		  options: InteractiveOptions,
		) => void;
	    ```
	  - Example
	    ```typescript
	    // each time a spot is created / modified, this function will be called
	    // you can do something to respond to interactives
	    (
	      // your spot data
	      metadata,
	      // rendered shape instance
	      shape,
	      {
	        // whether this spot is filtered
	        // `filtered` is calculated by:
	        //   metadataParser.parseFilteration
	        //   default is true
	        filtered,
	        // whether this spot is selected
	        // `selected` will be true if you call:
	        //   leafletSpots.selectSpot()
	        selected,
	      },
	    ) => {
	      // do something to your shape!
	      if (filtered === false) {
	        shape.remove();
	      }
	    }
	    ```
### instance.getLayer
> Get leaflet layer that contains all your spots
- Signature
	```typescript
	import { LayerGroup } from 'leaflet';
	public getLayer(): LayerGroup
	```
- Example
	```typescript
	// assume `map` is a leaflet map instance
	instance.getLayer().addTo(map);
	```
### instance.setSpots
> Performing a batch update
- Signature
    ```typescript
    public setSpots(spots: T[]): void
    ```
- Arguments
	- spots
	  Your data set.
	- T(Generic)
	  Your data unit type
- Example
	```typescript
	// assume you have no spots now
	const data: T[] = [...];
	// it will render all your data to spots
	//   according to metadataParser
	instance.setSpots(data);
	// now data changed
	const newData: T[] = [...];
	// it will compare `newData` with `data` automatically
	//   according to id(calculated by metadataParser.parseId)
	//
	// adding (newData ∖ data)
	// removing (data ∖ newData)
	// updating (data ∩ newData)
	//
	// whether performing an update is according to
	//   metadataParser.parseShouldUpdate
	instance.setSpots(newData);
	```
### instance.addSpot
> Add a spot to map
- Signature
	```typescript
	public addSpot(metadata: T): void
	```
- Arguments
	- metadata
	  Your data unit
	- T(Generic)
	  Type of your data unit
- Example
	```typescript
	const unit: T = {
	  ...
	};
	instance.addSpot(unit);
	```
### instance.removeSpot
> Remove a spot from map
- Signature
	```typescript
	public removeSpot(metadata: T): void
	```
- Arguments
	- metadata
	  Your data unit
	- T(Generic)
	  Type of your data unit
- Example
	```typescript
	const unit: T = {
	  ...
	};
	instance.addSpot(unit);
	instance.removeSpot(unit);
	```
### instance.updateSpot
> Update a spot
> Note: this method ignores `metadataParser.parseShouldUpdate`
- Signature
	```typescript
	public updateSpot(metadata: T): void
	```
- Arguments
	- metadata
	  Your data unit
	- T(Generic)
	  Type of your data unit
- Example
	```typescript
	const unit: T = {
	  ...
	};
	instance.addSpot(unit);
	// modify your data
	const newUnit: T = modify(unit);
	instance.updateSpot(unit);
	```
### instance.selectSpot
> Select a spot
- Signature
	```typescript
	public selectSpot(metadata: T): void
	```
- Arguments
	- metadata
	  Your data unit
	- T(Generic)
	  Type of your data unit
- Example
	```typescript
	const unit: T = {
	  ...
	};
	instance.addSpot(unit);
	instance.selectSpot(unit);
	```
### instance.unselectSpot
> Unselect a spot
- Signature
	```typescript
	public unselectSpot(metadata: T): void
	```
- Arguments
	- metadata
	  Your data unit
	- T(Generic)
	  Type of your data unit
- Example
	```typescript
	const unit: T = {
	  ...
	};
	instance.addSpot(unit);
	instance.selectSpot(unit);
	instance.unselectSpot(unit);
	```
### instance.forceRender
> Force rerender all spots
> Note: this method ignores `metadataParser.parseShouldUpdate`
- Signature
	```typescript
	public forceRender(): void
	```
- Example
	```typescript
	// assume you have no spots now
	const data: T[] = [...];
	// it will render all your data to spots
	//   according to metadataParser
	instance.setSpots(data);
	instance.forceRender();
	```

# class MetadataParser
### constructor

---

### Road Map
- [x] Support `Typescript`
- [x] Support `Javascript`
- [ ] Testing
- [x] Logo
- [ ] User manual
  - [x] Introduce
  - [x] Quick Start
  - [ ] API Reference
- [x] Demo page
- [x] Publish to NPM
