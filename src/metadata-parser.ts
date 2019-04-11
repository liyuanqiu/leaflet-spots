import { LatLng, Path } from "leaflet";

export type LatlngParser<T> = (metadata: T) => LatLng;
export type ShapeParser<T> = (metadata: T) => Path;
export type IdParser<T> = (metadata: T) => string;
export type ShouldUpdateParser<T> = (prev: T, next: T) => boolean;
export type FilterationParser<T> = (metadata: T) => boolean;

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

export default class MetadataParser<T> {
  public parseLatlng: LatlngParser<T>;
  public parseShape: ShapeParser<T>;
  public parseId: IdParser<T>;
  public parseShouldUpdate: ShouldUpdateParser<T>;
  public parseFilteration: FilterationParser<T>;

  constructor({
    parseLatlng,
    parseShape,
    parseId,
    parseShouldUpdate = () => true,
    parseFilteration = () => true,
  }: MetadataParserOptions<T>) {
    this.parseLatlng = parseLatlng;
    this.parseShape = parseShape;
    this.parseId = parseId;
    this.parseShouldUpdate = parseShouldUpdate;
    this.parseFilteration = parseFilteration;
  }
}
