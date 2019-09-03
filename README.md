<p align="center">
  <img width="200" src="https://github.com/liyuanqiu/leaflet-spots/raw/master/assets/logo.svg?sanitize=true">
</p>

### Introduce

> `leaflet-spots` is a paradigm and tool for rendering spots on a [leaflet](https://leafletjs.com/) map.

---

### Motivation

Part of my job is data visualization based on geographic location. For example:

- Texi/bus realtime positioning
- IoT realtime positioning
- Satellites projecting on earth
- User distribution

Taxis, buses, IoT devices, satellite projections, users need to be drawn on the map, and I call them `spot`. A taxi is a spot, a user is a spot, etc.

See this example:
<img width="500" src="https://github.com/liyuanqiu/leaflet-spots/raw/master/assets/screenshot.png?sanitize=true">

This kind of projects have an almost same logic, so I decided to abstract it out to be a common extension of `leaflet`.

---

### Demo

https://codesandbox.io/s/leaflet-spot-demo-80eyw

---

### Installation

```bash
# install dependency
yarn add leaflet
// or
// npm install --save leaflet
```

```bash
# install leaflet-spots
yarn add leaflet-spots
// or
// npm install --save leaflet-spots
```

---

### Quick Start

See this demo with source code:

https://codesandbox.io/s/leaflet-spot-demo-80eyw

---

### API Reference

```javascript
import { LeafletSpots, MetadataParser } from 'leaflet-spots';
```

#### class MetadataParser\<T\>

> Describe how to parse your data in class MetadataParser

> `T` is the type of your metadata like `{ id: 1, lng: 120, lat: 30 }`

| Method      | Parameters                 | Return | Description |
| ----------- | -------------------------- | ------ | ----------- |
| constructor | MetadataParserOptions\<T\> | -      | -           |

##### MetadataParserOptions

```typescript
export interface MetadataParserOptions<T> {
  /**
   * parse lat,lng from metadata
   */
  parseLatlng: LatlngParser<T>;
  /**
   * parse leaflet shape from metadata
   */
  parseShape: ShapeParser<T>;
  /**
   * parse id from metadata
   */
  parseId: IdParser<T>;
  /**
   * parse whether the station should be update
   */
  parseShouldUpdate?: ShouldUpdateParser<T>;
  /**
   * parse whether the station is filtered
   */
  parseFilteration?: FilterationParser<T>;
}
```

##### Parser types

```typescript
export type LatlngParser<T> = (metadata: T) => LatLng;
export type ShapeParser<T> = (metadata: T) => Layer;
export type IdParser<T> = (metadata: T) => string;
export type ShouldUpdateParser<T> = (prev: T, next: T) => boolean;
export type FilterationParser<T> = (metadata: T) => boolean;
```

#### class LeafletSpots\<T\>

> Using this class to visualize your data

> `T` is the type of your metadata like `{ id: 1, lng: 120, lat: 30 }`

| Method       | Parameters               | Return                                                              | Description                                                           |
| ------------ | ------------------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| constructor  | LeafletSpotsOptions\<T\> | -                                                                   | -                                                                     |
| getLayer     | -                        | [LayerGroup](https://leafletjs.com/reference-1.5.0.html#layergroup) | The layer group that holds all the spots                              |
| setSpots     | T[]                      | void                                                                | Set spots data, LeafletSpots will render them to leaflet map instance |
| addSpot      | T                        | void                                                                | Add a spot to leaflet map instance                                    |
| removeSpot   | T                        | void                                                                | Remove a spot from leaflet map instance                               |
| updateSpot   | T                        | void                                                                | Update a spot in leaflet map instance                                 |
| selectSpot   | T                        | void                                                                | Mark this spot to be selected                                         |
| unselectSpot | T                        | void                                                                | Cancel selection                                                      |
| forceRender  | -                        | void                                                                | Force rerender all spots                                              |

---

##### LeafletSpotsOptions

```typescript
/**
 * The options to create the instance of `LeafletSpots`
 * @template T User data unit
 */
export interface LeafletSpotsOptions<T> {
  /**
   * Use `MetadatParser` to parse user data.
   * @template T User data unit
   */
  metadataParser: MetadataParser<T>;
  /**
   * The spot events which will be attached to the spot.
   * @template T User data unit
   */
  spotEvents?: SpotEvents<T>;
  /**
   * handle interactive like 'selected', 'filtered', etc
   * @template T User data unit
   */
  handleInteractive?: InteractiveHandler<T>;
}
```

##### SpotEvents\<T\>

```typescript
/**
 * The spot events which will be attached to the spot.
 * @template T User data unit
 */
export interface SpotEvents<T> {
  [eventName: string]: (e: LeafletEvent, metadata: T) => void;
}
```

##### InteractiveHandler\<T\>

```typescript
/**
 * Interactive options.
 */
export interface InteractiveOptions {
  filtered: boolean;
  selected: boolean;
}

/**
 * User defined handler for interactive.
 * @template T User data unit
 */
export type InteractiveHandler<T> = (
  metadata: T,
  shape: Layer,
  options: InteractiveOptions,
) => void;
```

### Road Map

- [x] Support `Typescript`
- [x] Support `Javascript`
- [ ] Testing
- [x] Logo
- [x] User manual
  - [x] Introduce
  - [x] Quick Start
  - [x] API Reference
- [x] Demo page
- [x] Publish to NPM
