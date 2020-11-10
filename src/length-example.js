import 'ol/ol.css';
import Draw from 'ol/interaction/Draw';
import Overlay from 'ol/Overlay';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { LineString } from 'ol/geom';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { getLength } from 'ol/sphere';
import { unByKey } from 'ol/Observable';

/**
 * Format length output.
 * @param {LineString} line The line.
 * @return {string} The formatted length.
 */
export const formatLength = line => {
  const length = getLength(line);
  let output = Math.round((length / 10) * 100) / 100 + ' ' + 'mm';
  return output;
};






export const addLengthToMap = map => {
  const source = new VectorSource();
  const raster = new TileLayer({ source: new OSM() });
  const vector = new VectorLayer({
    source: source,
    style: new Style({
      fill: new Fill({ color: 'rgba(255, 255, 255, 0.2)' }),
      stroke: new Stroke({ color: '#ffcc33', width: 2 }),
      image: new CircleStyle({ radius: 7, fill: new Fill({ color: '#ffcc33' }) }),
    }),
  });

  /** Add layers */
  map.addLayer(raster);
  map.addLayer(vector);

  /**
   * Currently drawn feature.
   * @type {import('../src/ol/Feature.js').default}
   */
  let sketch;

  /**
   * The help tooltip element.
   * @type {HTMLElement}
   */
  let helpTooltipElement;

  /**
   * Overlay to show the help messages.
   * @type {Overlay}
   */
  let helpTooltip;

  /**
   * The measure tooltip element.
   * @type {HTMLElement}
   */
  let measureTooltipElement;

  /**
   * Overlay to show the measurement.
   * @type {Overlay}
   */
  let measureTooltip;

  /**
   * Message to show when the user is drawing a line.
   * @type {string}
   */
  let continueLineMsg = 'Click to continue drawing the line';

  /**
   * Handle pointer move.
   * @param {import('ol/MapBrowserEvent').default} evt The event.
   */
  const pointerMoveHandler = evt => {
    if (evt.dragging) return;

    /** @type {string} */
    const helpMsg = 'Click to start drawing';

    if (sketch) {
      helpMsg = continueLineMsg;
    }

    helpTooltipElement.innerHTML = helpMsg;
    helpTooltip.setPosition(evt.coordinate);
    helpTooltipElement.classList.remove('hidden');
  };

  map.on('pointermove', pointerMoveHandler);

  map.getViewport().addEventListener('mouseout', () => helpTooltipElement.classList.add('hidden'));

  /** Global so we can remove it later */
  let draw;

  /**
   * Format length output.
   * @param {LineString} line The line.
   * @return {string} The formatted length.
   */
  const formatLength = line => {
    const length = getLength(line);
    let output;
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
    } else {
      output = Math.round(length * 100) / 100 + ' ' + 'm';
    }
    return output;
  };

  function addInteraction() {
    draw = new Draw({
      source,
      type: 'LineString',
      style: new Style({
        fill: new Fill({ color: 'rgba(255, 255, 255, 0.2)' }),
        stroke: new Stroke({ color: 'rgba(0, 0, 0, 0.5)', lineDash: [10, 10], width: 2 }),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({ color: 'rgba(0, 0, 0, 0.7)' }),
          fill: new Fill({ color: 'rgba(255, 255, 255, 0.2)' }),
        }),
      }),
    });

    map.addInteraction(draw);

    createMeasureTooltip();

    let listener;
    draw.on('drawstart', evt => {
      // set sketch
      sketch = evt.feature;

      /** @type {import('ol/coordinate.js').Coordinate|undefined} */
      let tooltipCoord = evt.coordinate;

      listener = sketch.getGeometry().on('change', evt => {
        let geom = evt.target;
        let output;

        output = formatLength(geom);
        tooltipCoord = geom.getLastCoordinate();

        measureTooltipElement.innerHTML = output;
        measureTooltip.setPosition(tooltipCoord);
      });
    });

    draw.on('drawend', () => {
      measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
      measureTooltip.setOffset([0, -7]);
      // unset sketch
      sketch = null;
      // unset tooltip so that a new one can be created
      measureTooltipElement = null;
      createMeasureTooltip();
      unByKey(listener);
    });
  }

  /**
   * Creates a new measure tooltip
   */
  function createMeasureTooltip() {
    if (measureTooltipElement) {
      measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    measureTooltip = new Overlay({
      element: measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center',
    });

    map.addOverlay(measureTooltip);
  }

  /**
   * Let user change the geometry type.
   */
  // map.removeInteraction(draw);
  // addInteraction();

  addInteraction();
};