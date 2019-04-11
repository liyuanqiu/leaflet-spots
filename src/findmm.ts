import LeafletSpots, { LeafletSpotsOptions } from './index';
import { PolylineOptions, Popup, Polyline, polyline } from 'leaflet';

const defaultLinkOptions: PolylineOptions = {
  weight: 1,
  color: 'red',
};

interface LinkParametes<T> {
  from: T;
  to: T;
  linkOptions?: PolylineOptions;
  popup?: Popup;
}

interface Line {
  fromId: string;
  toId: string;
  line: Polyline;
}

class FindMMLeafletSpots<T> extends LeafletSpots<T> {
  private lines: Line[];

  public constructor({
    metadataParser,
    spotEvents,
    handleInteractive = () => {},
  }: LeafletSpotsOptions<T>) {
    super({
      metadataParser,
      spotEvents,
      handleInteractive,
    });
    this.lines = [];
  }

  public getSpots() {
    return this.spots;
  }

  /**
   * Draw a line between spots
   * @param {{from: T}} linkParameters
   */
  public link({
    from, to,
    linkOptions = {},
    popup,
  }: LinkParametes<T>): void {
    const options = {
      ...defaultLinkOptions,
      ...linkOptions,
    };
    const { parseId, parseLatlng } = this.metadataParser;
    const fromId = parseId(from);
    const toId = parseId(to);
    // if shape not exists, stop draw
    if (this.spots[fromId] === undefined || this.spots[toId] === undefined) {
      return;
    }
    // if line exists, stop draw
    if (this.lines.find(line => 
      (line.fromId === fromId && line.toId === toId)
      || (line.fromId === toId && line.toId === fromId)
    ) !== undefined) {
      return;
    }
    const fromLatlng = parseLatlng(from);
    const toLatlng = parseLatlng(to);
    const line = polyline([fromLatlng, toLatlng], options).addTo(this.layer);
    if (popup !== undefined) {
      line.bindPopup(popup); 
    }
    this.lines.push({
      fromId,
      toId,
      line,
    });
  }

  /**
   * Remove a line between spots
   * @param {T} from
   * @param {T} to
   */
  public unlink(from: T, to: T): void {
    const { parseId } = this.metadataParser;
    const fromId = parseId(from);
    const toId = parseId(to);
    const i = this.lines.findIndex(line =>
      (line.fromId === fromId && line.toId === toId)
      || (line.fromId === toId && line.toId === fromId)
    );
    if (i >= 0) {
      const line = this.lines[i];
      line.line.remove();
      this.lines.splice(i, 1);
    }
  }

  /**
   * Remove all lines
   */
  public unlinkAll(): void {
    this.lines.forEach(line => line.line.remove());
    this.lines = [];
  }
}

export default FindMMLeafletSpots;