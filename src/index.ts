import {
  Path,
  LayerGroup, layerGroup,
  LeafletEvent,
} from 'leaflet';

/**
 * Use `MetadatParser` to parse user data.
 */
import MetadataParser from './metadata-parser';

/**
 * The spot events which will be attached to the spot.
 * @template T User data unit
 */
export interface SpotEvents<T> {
  [eventName: string]: (e: LeafletEvent, metadata: T) => void;
}

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
export type InteractiveHandler<T> = (metadata: T, shape: Path, options: InteractiveOptions) => void;

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

/**
 * The data unit structure that `LeafletSpots` store data.
 * @template T User data unit
 */
export interface SpotUnit<T> {
  metadata: T;
  shape: Path;
}

/**
 * The data structure that `LeafletSpots` store data.
 * @template T User data unit
 */
export interface Spots<T> {
  [id: string]: SpotUnit<T>;
}

/**
 * Render engine for rendering spots on `leaflet` based system.
 * @template T User data unit
 */
class LeafletSpots<T> {
  /**
   * A helper to parse user data T
   * @protected
   * @template T User data unit
   */
  protected metadataParser: MetadataParser<T>;
  /**
   * Spots data storage
   * @protected
   * @template T User data unit
   */
  protected spots: Spots<T>;
  /**
   * The layer that all the spots are rendered on
   * @protected
   */
  protected layer: LayerGroup;
  /**
   * Current selected spot's id
   * `id` is parsed from user data by `MetadataParser`
   * @protected
   */
  private selected: string | null;
  /**
   * Spots' event
   * @private
   * @template T User data unit
   */
  private spotEvents: SpotEvents<T>;
  /**
   * Interactive handler
   * @private
   * @template T User data unit
   */
  private handleInteractive: InteractiveHandler<T>;

  public constructor({
    metadataParser,
    spotEvents = {},
    handleInteractive = (): void => {},
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
   * @returns {LayerGroup} the layer
   */
  public getLayer(): LayerGroup {
    return this.layer;
  }

  /**
   * Set new spots
   * 1. add non-existing spots(by id)
   * 2. update existing spots(by id)
   * 3. remove excess spots(by id)
   * @param {T[]} spots 
   */
  public setSpots(spots: T[]): void {
    const { parseId, parseShouldUpdate } = this.metadataParser;
    const spotsMap: {
      [id: string]: 1;
    } = {};
    spots.forEach((metadata: T): void => {
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
    Object.keys(this.spots).forEach((id): void => {
      if (spotsMap[id] === undefined) {
        const { metadata } = this.spots[id];
        this.removeSpot(metadata);
      }
    });
  }

  /**
   * Add a spot
   * 1. if id existing, abort
   * 2. add spot
   * @param {T} metadata
   */
  public addSpot(metadata: T): void {
    const { parseId, parseShape, parseFilteration } = this.metadataParser;
    const id = parseId(metadata);
    if (this.spots[id] !== undefined) {
      throw new Error('Can\'t add spot. Same id already exists!');
    }
    const shape = parseShape(metadata);
    Object.keys(this.spotEvents).forEach((eventName): void => {
      const handler = this.spotEvents[eventName];
      shape.on(eventName, (e): void => handler(e, metadata));
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

  /**
   * Remove a spot without unselect it
   * @private for inner usage
   * @param {T} metadata 
   */
  private removeSpotWithoutUnselect(metadata: T): void {
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
   * 1. remove it
   * 2. unselect it
   * @param {T} metadata
   */
  public removeSpot(metadata: T): void {
    this.removeSpotWithoutUnselect(metadata);
    this.unselectSpot(metadata);
  }

  /**
   * Update a spot
   * 1. remove it without unselect
   * 2. recreate a new spot
   * @param {T} metadata
   */
  public updateSpot(metadata: T): void {
    this.removeSpotWithoutUnselect(metadata);
    this.addSpot(metadata);
  }

  /**
   * handle selection
   * 1. update `selected` member
   * 2. update spot
   * @param {T} metadata
   * @param {boolean} selected
   */
  private handleSelection(metadata: T, selected: boolean): void {
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
   * 1. unselect the previous selected one
   * 2. select this one
   * @param {T} metadata 
   */
  public selectSpot(metadata: T): void {
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
    this.handleSelection(metadata, false);
  }

  /**
   * Force rerender all spots
   */
  public forceRender(): void {
    Object.keys(this.spots).forEach((id): void => {
      const { metadata } = this.spots[id];
      this.updateSpot(metadata);
    });
  }
}

export default LeafletSpots;