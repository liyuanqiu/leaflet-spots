import {
  Path,
  LayerGroup, layerGroup,
  LeafletEvent,
} from 'leaflet';

import MetadataParser from './metadata-parser';

export interface SpotEvents<T> {
  [eventName: string]: (e: LeafletEvent, metadata: T) => void;
}

export interface InteractiveOptions {
  filtered: boolean;
  selected: boolean;
}

export type InteractiveHandler<T> = (metadata: T, shape: Path, options: InteractiveOptions) => void;

export interface LeafletSpotsOptions<T> {
  metadataParser: MetadataParser<T>;
  spotEvents: SpotEvents<T>;
  /**
   * handle interactive like 'selected', 'filtered', etc
   */
  handleInteractive?: InteractiveHandler<T>;
}

export interface SpotUnit<T> {
  metadata: T;
  shape: Path;
}

export interface Spots<T> {
  [id: string]: SpotUnit<T>;
}

class LeafletSpots<T> {
  protected metadataParser: MetadataParser<T>;
  protected spots: Spots<T>;
  protected layer: LayerGroup;
  private selected: string | null;
  private spotEvents: SpotEvents<T>;
  private handleInteractive: InteractiveHandler<T>;

  public constructor({
    metadataParser,
    spotEvents,
    handleInteractive = () => {},
  }: LeafletSpotsOptions<T>) {
    this.metadataParser = metadataParser;
    this.spotEvents = spotEvents;
    this.handleInteractive = handleInteractive;
    this.selected = null;
    this.spots = {};
    this.layer = layerGroup();
  }

  /**
   * Get the layer object
   */
  public getLayer(): LayerGroup {
    return this.layer;
  }

  /**
   * Set new spots
   * @param {T[]} spots 
   */
  public setSpots(spots: T[]): void {
    // console.log('setSpots');
    const { parseId, parseShouldUpdate } = this.metadataParser;
    const spotsMap: {
      [id: string]: 1;
    } = {};
    spots.forEach((metadata: T) => {
      const id = parseId(metadata);
      spotsMap[id] = 1;
      const spotUnit = this.spots[id];
      if (spotUnit === undefined) {
        this.addSpot(metadata);
      } else {
        if (parseShouldUpdate(spotUnit.metadata, metadata)) {
          this.updateSpot(metadata);
        }
      }
    });
    Object.keys(this.spots).forEach((id) => {
      if (spotsMap[id] === undefined) {
        const { metadata } = this.spots[id];
        this.removeSpot(metadata);
      }
    });
  }

  /**
   * Add a spot
   * @param {T} metadata
   */
  public addSpot(metadata: T): void {
    // console.log('addSpot');
    const { parseId, parseShape, parseFilteration } = this.metadataParser;
    const id = parseId(metadata);
    if (this.spots[id] !== undefined) {
      throw new Error('Can\'t add spot. Same id already exists!');
    }
    const shape = parseShape(metadata);
    Object.keys(this.spotEvents).forEach((eventName) => {
      const handler = this.spotEvents[eventName];
      shape.on(eventName, (e) => handler(e, metadata));
    });
    shape.addTo(this.layer);
    // handle interactive
    const filtered = parseFilteration(metadata);
    const selected = id === this.selected;
    this.handleInteractive(metadata, shape, {
      filtered,
      selected,
    });
    this.spots[id] = {
      metadata,
      shape,
    };
  }

  private removeSpotWithoutUnselect(metadata: T): void {
    // console.log('removeSpotWithoutUnselected');
    const { parseId } = this.metadataParser;
    const id = parseId(metadata);
    const spotUnit = this.spots[id];
    if (spotUnit === undefined) {
      return;
    }
    const { shape } = spotUnit;
    shape.remove();
    delete this.spots[id];
  }

  /**
   * Remove a spot
   * @param {T} metadata
   */
  public removeSpot(metadata: T): void {
    // console.log('removeSpot');
    this.removeSpotWithoutUnselect(metadata);
    this.unselectSpot(metadata);
  }

  /**
   * Update a spot
   * @param {T} metadata
   */
  public updateSpot(metadata: T): void {
    // console.log('updateSpot');
    this.removeSpotWithoutUnselect(metadata);
    this.addSpot(metadata);
  }

  /**
   * handle selection
   * @param {T} metadata
   * @param {boolean} selected
   */
  private handleSelection(metadata: T, selected: boolean): void {
    // console.log('handleSelection');
    const { parseId } = this.metadataParser;
    const id = parseId(metadata);
    const spotUnit = this.spots[id];
    if (spotUnit === undefined) {
      return;
    }
    this.selected = selected ? id : null;
    this.updateSpot(metadata);
  }

  /**
   * Select a spot
   * @param {T} metadata 
   */
  public selectSpot(metadata: T): void {
    // console.log('selectSpot');
    if (this.selected !== null) {
      const { metadata } = this.spots[this.selected];
      this.unselectSpot(metadata);
    }
    this.handleSelection(metadata, true);
  }

  /**
   * Unselect a spot
   * @param {T} metadata
   */
  public unselectSpot(metadata: T): void {
    // console.log('unselectSpot');
    this.handleSelection(metadata, false);
  }

  /**
   * Force rerender all spots
   */
  public forceRender(): void {
    // console.log('forceRender', Object.keys(this.spots).length);
    Object.keys(this.spots).forEach((id) => {
      const { metadata } = this.spots[id];
      this.updateSpot(metadata);
    });
  }
}

export default LeafletSpots;