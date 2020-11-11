import 'ol/ol.css';
import Overlay from 'ol/Overlay';
import { LineString } from 'ol/geom';
import { getLength } from 'ol/sphere';
import { unByKey } from 'ol/Observable';
import { default as LineStringGeometry } from 'ol/geom/LineString';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import DragPan from 'ol/interaction/DragPan';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Collection from 'ol/Collection';
import Map from 'ol/Map';

const CustomGeometry = {
  Length: 'Length',
  Arrow: 'Arrow',
  FreeText: 'FreeText'
};

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

const listeners = {};
const measureMarkers = {};
const styleTag = document.createElement("style");
styleTag.innerHTML = `
  .ol-tooltip {
    color: #9ccef9;
    padding: 4px 8px;
    white-space: nowrap;
    font-size: 14px;
    position: absolute;
  }
  .ol-tooltip-measure { opacity: 1; }
  .ol-tooltip-static { color: #9ccef9; }
  .ol-tooltip-measure:before,
  .ol-tooltip-static:before {
    content: '',
  }

  #marker { cursor: move; }
  .marker-container { display: block !important; }
`;

const stylesOverlay = new Overlay({ element: styleTag });

/**
 * Creates an overlay with a div containing length information.
 * 
 * @param {Feature} feature The feature to plug the measure marker
 * @param {Map} map The map instance
 */
const createMeasureMarker = (feature, map) => {
  const featureId = feature.ol_uid;

  if (!measureMarkers[featureId]) {
    measureMarkers[featureId] = {};

    const markerElement = document.createElement("div");
    markerElement.id = 'marker';
    markerElement.className = 'ol-tooltip ol-tooltip-measure';
    markerElement.innerHTML = '';

    measureMarkers[featureId].element = markerElement;
    measureMarkers[featureId].overlay = new Overlay({
      positioning: 'center-center',
      element: markerElement,
      className: 'marker-container',
      stopEvent: false,
      dragging: false
    });

    let dragPan;
    map.getInteractions().forEach(interaction => {
      if (interaction instanceof DragPan) {
        dragPan = interaction;
      }
    });

    markerElement.addEventListener('mousedown', () => {
      const marker = measureMarkers[featureId];
      if (marker) {
        dragPan.setActive(false);
        marker.overlay.set('dragging', true);
      }
    });

    map.on('pointermove', event => {
      const marker = measureMarkers[featureId];
      if (marker && marker.overlay.get('dragging') === true) {
        marker.overlay.setPosition(event.coordinate);
        drawLink({
          id: featureId,
          map,
          feature,
          measureMarker: marker.overlay,
        });
      }
    });

    map.on('pointerup', () => {
      const marker = measureMarkers[featureId];
      if (marker && marker.overlay.get('dragging') === true) {
        dragPan.setActive(true);
        marker.overlay.set('dragging', false);
      }
    });

    map.addOverlay(measureMarkers[featureId].overlay);
  }
};

/**
 * Updates measurement marker location based on LineStringGeometry change events
 * for a specific feature id.
 * 
 * @param {object} event The event
 */
const updateMeasureMarkerLocation = evt => {
  evt.features.forEach(feature => {
    const sketch = feature;
    const featureId = sketch.ol_uid;
    if (measureMarkers[featureId]) {
      let tooltipCoord = evt.coordinate;
      const gem = sketch.getGeometry();
      if (gem instanceof LineStringGeometry) {
        listeners[featureId] = gem.on('change', evt => {
          let geom = evt.target;
          let output = formatLength(geom);
          tooltipCoord = geom.getLastCoordinate();
          measureMarkers[featureId].element.innerHTML = output;
          measureMarkers[featureId].overlay.setPosition(tooltipCoord);
          drawLink({
            id: featureId,
            map,
            feature: sketch,
            measureMarker: measureMarkers[featureId].overlay,
          });
        });
      }
    }
  });
};

/**
 * Builds a new LineStringGeometry instance with the shortest
 * distance between a given overlay and a feature.
 * 
 * @param {object} feature The feature
 * @param {object} overlay The overlay instance
 * @returns {LineStringGeometry} The smallest line between the overlay and feature
 */
const getShortestLineBetweenOverlayAndFeature = (feature, overlay) => {
  let result;
  let distanceSq = Infinity;

  const featureGeometry = feature.getGeometry();
  const geometry = featureGeometry.getLinearRing ? featureGeometry.getLinearRing(0) : featureGeometry;

  geometry.getCoordinates().forEach(coordinates => {
    const closest = overlay.getPosition();
    const distanceNew = Math.pow(closest[0] - coordinates[0], 2) + Math.pow(closest[1] - coordinates[1], 2);
    if (distanceNew < distanceSq) {
      distanceSq = distanceNew;
      result = [coordinates, closest];
    }
  });

  const coordinates = overlay.getPosition();
  const closest = geometry.getClosestPoint(coordinates);
  const distanceNew = Math.pow(closest[0] - coordinates[0], 2) + Math.pow(closest[1] - coordinates[1], 2);
  if (distanceNew < distanceSq) {
    distanceSq = distanceNew;
    result = [closest, coordinates];
  }

  return new LineStringGeometry(result);
};

/**
 * This event is responsible to create/update the measure mark on drawstart event
 * and cache the marker using the feature id.
 * 
 * @param {object} event The event
 */
const onDrawStart = event => {
  const featureId = event.feature.ol_uid;
  createMeasureMarker(event.feature, map);
  const sketch = event.feature;
  let tooltipCoord = event.coordinate;
  listeners[featureId] = sketch.getGeometry().on('change', event => {
    let geom = event.target;
    let output = formatLength(geom);
    tooltipCoord = geom.getLastCoordinate();
    measureMarkers[featureId].element.innerHTML = output;
    measureMarkers[featureId].overlay.setPosition(tooltipCoord);
    drawLink({
      id: featureId,
      map,
      feature: sketch,
      measureMarker: measureMarkers[featureId].overlay,
    });
  });
};

/**
 * This event is responsible to unbind the previsouly set listener on drawstart
 * and assign marker classes.
 * 
 * @param {object} event The event
 */
const onDrawEnd = event => {
  const featureId = event.feature.ol_uid;
  if (measureMarkers[featureId]) {
    measureMarkers[featureId].element.className = 'ol-tooltip ol-tooltip-static';
    measureMarkers[featureId].overlay.setOffset([0, -7]);
    unByKey(listeners[featureId]);
  }
};

const eventKeys = {};

/**
 * This utility makes use of the unByKey to unbind an event.
 * 
 * @param {string} eventKey The event name/key
 */
const unbindEvent = eventKey => {
  if (eventKeys[eventKey]) {
    unByKey(eventKeys[eventKey]);
    eventKeys[eventKey] = null;
  }
};

const linkFeatures = new Collection([], { unique: true });
const linkStyle = new Style({
  stroke: new Stroke({
    color: '#9ccef9',
    lineDash: [.3, 7],
    width: 3
  })
});
const linksSource = new VectorSource({ features: linkFeatures });
const linksVector = new VectorLayer({
  source: linksSource,
  style: [linkStyle]
});

export const addDrawLinksLayer = ({ map }) => map.addLayer(linksVector);

/**
 * This method draws a line between a feature and its marker.
 * 
 * @param {object} options
 * @param {object} options.id The link id
 * @param {object} options.feature The feature
 * @param {object} options.measureMarker The feature marker defined previously
 */
export const drawLink = ({ id, feature, measureMarker }) => {
  const lineString = getShortestLineBetweenOverlayAndFeature(feature, measureMarker);

  const updated = linkFeatures.getArray().some(feature => {
    if (feature.getId() === id) {
      feature.setGeometry(lineString);
      return true;
    }
  });

  if (!updated) {
    const featureLink = new Feature({ geometry: lineString, name: 'Line' });
    featureLink.setId(id);
    linkFeatures.push(featureLink);
  }
};

const LengthGeometry = {
  init: ({ map }) => {
    map.addOverlay(stylesOverlay);
    addDrawLinksLayer({ map });
  },
  wireEvents: interactions => {
    if (interactions.draw) {
      unbindEvent('drawstart');
      unbindEvent('drawend');
      eventKeys['drawstart'] = interactions.draw.on('drawstart', onDrawStart);
      eventKeys['drawend'] = interactions.draw.on('drawend', onDrawEnd);
    }

    if (interactions.translate) {
      unbindEvent('translatestart');
      eventKeys['translatestart'] = interactions.translate.on(
        'translatestart',
        updateMeasureMarkerLocation
      );
    }

    if (interactions.modify) {
      unbindEvent('modifystart');
      eventKeys['modifystart'] = interactions.modify.on(
        'modifystart',
        updateMeasureMarkerLocation
      );
    }
  },
  remove: ({ feature, map }) => {
    const featureId = feature.ol_uid;
    if (measureMarkers && measureMarkers[featureId]) {
      const { overlay } = measureMarkers[featureId];
      map.removeOverlay(overlay);
      measureMarkers[featureId] = null;
      listeners[featureId] = null;
    }

    const drawnLink = linkFeatures.getArray().find(feature => feature.getId() === featureId);
    if (drawnLink) {
      linkFeatures.remove(drawnLink);
    }
  }
};

export default LengthGeometry;