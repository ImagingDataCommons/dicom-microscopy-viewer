import DragPan from 'ol/interaction/DragPan';
import Overlay from 'ol/Overlay';
import VectorLayer from 'ol/layer/Vector';
import 'ol/ol.css';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import { unByKey } from 'ol/Observable';

import { generateUID } from '../utils';
import { getShortestLineBetweenOverlayAndFeature } from './utils';

const MapEvents = {
  POINTER_MOVE: 'pointermove',
  POINTER_UP: 'pointerup'
};

class MarkerManager {
  constructor({ map, geometry, formatter } = {}) {
    this._markers = {};
    this._listeners = {};
    this._geometry = geometry;
    this._formatter = formatter;
    this._links = new Collection([], { unique: true });
    this._map = map;

    const styleTag = document.createElement('style');
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

    const linksVector = new VectorLayer({
      source: new VectorSource({ features: this._links }),
      style: [new Style({
        stroke: new Stroke({
          color: '#9ccef9',
          lineDash: [.3, 7],
          width: 3
        })
      })]
    });

    this._map.addOverlay(new Overlay({ element: styleTag }));
    this._map.addLayer(linksVector);

    this.onInteractionsChange(this._map.getInteractions());

    /** Bind events */
    this._onDrawStart = this._onDrawStart.bind(this);
    this._onDrawEnd = this._onDrawEnd.bind(this);
    this._onTranslateStart = this._onTranslateStart.bind(this);
    this._onModifyStart = this._onModifyStart.bind(this);
  }

  /**
   * Returns a marker
   * 
   * @param {string} id The marker id
   * @return {object} The marker
   */
  get(id) {
    return this._markers[id];
  }

  /**
   * Removes a marker
   * 
   * @param {string} id The marker id
   * @return {string} The marker id
   */
  remove(id) {
    const marker = this.get(id);
    if (marker) {
      this._map.removeOverlay(marker.overlay);
      this._markers[id] = null;
      const drawnLink = this._links.getArray().find(feature => feature.getId() === id);
      if (drawnLink) this._links.remove(drawnLink);
      if (this._listeners[id]) this._listeners[id] = null;
    }
    return id;
  }

  /**
   * Sets a marker
   * 
   * @param {object} marker The marker
   * @return {void}
   */
  set(marker) {
    this._markers[marker.id] = marker;
  }

  /**
   * Creates a new marker
   * 
   * @param {Feature} feature The feature to plug the measure marker
   * @param {string} id The marker id
   * @return {string} The marker id
   */
  create({ id, feature }) {
    if (!this._isValidFeature(feature)) {
      console.warn('Invalid feature geometry:', feature.getGeometryName());
      return;
    }

    const uid = id || generateUID();

    if (!this._markers[uid]) {
      this._markers[uid] = { id: uid };
      this._markers[uid].drawLink = feature => this._drawLink(feature, this._markers[uid]);

      const element = document.createElement('div');
      element.id = 'marker';
      element.className = 'ol-tooltip ol-tooltip-measure';
      element.innerHTML = '';

      this._markers[uid].element = element;
      this._markers[uid].overlay = new Overlay({
        className: 'marker-container',
        positioning: 'center-center',
        stopEvent: false,
        dragging: false,
        element,
      });

      let dragPan;
      let dragProperty = 'dragging';
      this._map.getInteractions().forEach(interaction => {
        if (interaction instanceof DragPan) {
          dragPan = interaction;
        }
      });

      element.addEventListener('mousedown', () => {
        const marker = this._markers[uid];
        if (marker) {
          dragPan.setActive(false);
          marker.overlay.set(dragProperty, true);
        }
      });

      this._map.on(MapEvents.POINTER_MOVE, event => {
        const marker = this._markers[uid];
        if (marker && marker.overlay.get(dragProperty) === true) {
          marker.overlay.setPosition(event.coordinate);
          marker.drawLink(feature);
        }
      });

      this._map.on(MapEvents.POINTER_UP, () => {
        const marker = this._markers[uid];
        if (marker && marker.overlay.get(dragProperty) === true) {
          dragPan.setActive(true);
          marker.overlay.set(dragProperty, false);
        }
      });

      this._map.addOverlay(this._markers[uid].overlay);

      return uid;
    }

    return this._markers[uid].id;
  }

  /**
   * Checks if feature has correct geometry 
   * 
   * @param {Feature} feature The feature
   */
  _isValidFeature(feature) {
    return feature.getGeometryName() === this._geometry;
  }

  /**
   * Update marker content
   * 
   * @param {string} id The marker id
   * @param {string} value The marker content
   * @param {string} coordinate The marker coordinate
   */
  _updateMarker({ id, value, coordinate }) {
    const marker = this.get(id);
    if (marker) {
      marker.element.innerHTML = value;
      marker.overlay.setPosition(coordinate);
      this.set({ id, ...marker });
    }
  }

  /**
   * This utility makes use of the unByKey to unbind an event
   * 
   * @param {string} eventKey The event name/key
   */
  _unbindEvent(eventKey) {
    if (this._listeners[eventKey]) {
      unByKey(this._listeners[eventKey]);
      this._listeners[eventKey] = null;
    }
  };

  /**
   * Updates marker location on geometry change
   * 
   * @param {object} event The event
   */
  _updateMarkerLocation(event) {
    event.features.forEach(feature => {
      if (this._isValidFeature(feature)) {
        this._updateMarkerOnGeometryChange({
          feature, coordinate: event.coordinate
        });
      }
    });
  }

  /**
   * This event is responsible to unbind the previsouly set listener on drawstart
   * and assign marker classes
   * 
   * @param {object} event The event
   */
  _onDrawEnd(event) {
    const feature = event.feature;
    if (this._isValidFeature(feature)) {
      const featureId = feature.ol_uid;
      const marker = this.get(featureId);
      if (marker) {
        marker.element.className = 'ol-tooltip ol-tooltip-static';
        marker.overlay.setOffset([0, -7]);
        this.set({ id: featureId, ...marker });
        unByKey(this._listeners['drawend']);
      }
    }
  }

  /**
   * Update marker location on geometry change
   * 
   * @param {object} feature The feature
   * @param {object} coordinate The marker coordinate
   */
  _updateMarkerOnGeometryChange({ feature, coordinate }) {
    let markerCoordinate = coordinate;
    const featureId = feature.ol_uid;
    this._listeners[featureId] = feature.getGeometry().on('change', event => {
      const marker = this.get(featureId);
      if (marker) {
        let currentGeometry = event.target;
        let output = this._formatter(currentGeometry);
        markerCoordinate = currentGeometry.getLastCoordinate();
        this._updateMarker({ id: featureId, value: output, coordinate: markerCoordinate });
        marker.drawLink(feature);
      }
    });
  }

  onInteractionsChange(interactions) {
    if (interactions.draw) {
      this._unbindEvent('drawstart');
      this._unbindEvent('drawend');
      this._listeners['drawstart'] = interactions.draw.on('drawstart', this._onDrawStart);
      this._listeners['drawend'] = interactions.draw.on('drawend', this._onDrawEnd);
    }

    if (interactions.translate) {
      this._unbindEvent('translatestart');
      this._listeners['translatestart'] = interactions.translate.on('translatestart', this._onTranslateStart);
    }

    if (interactions.modify) {
      this._unbindEvent('modifystart');
      this._listeners['modifystart'] = interactions.modify.on('modifystart', this._onModifyStart);
    }
  }

  /**
   * Create or update the marker on drawstart
   * and cache it
   * 
   * @param {object} event The drawstart event
   */
  _onDrawStart(event) {
    const feature = event.feature;
    if (this._isValidFeature(feature)) {
      this.create({ id: feature.ol_uid, feature });
      this._updateMarkerOnGeometryChange({ feature, coordinate: event.coordinate });
    }
  }

  /**
   * Update marker location on translatestart
   * 
   * @param {object} event The translatestart event
   */
  _onTranslateStart(event) {
    this._updateMarkerLocation(event);
  };

  /**
   * Update marker location on modifystart
   * 
   * @param {object} event The modifystart event
   */
  _onModifyStart(event) {
    this._updateMarkerLocation(event);
  }

  _drawLink(feature, marker) {
    const line = getShortestLineBetweenOverlayAndFeature(feature, marker.overlay);

    const updated = this._links.getArray().some(feature => {
      if (feature.getId() === marker.id) {
        feature.setGeometry(line);
        return true;
      }
    });

    if (!updated) {
      const feature = new Feature({ geometry: line, name: 'Line' });
      feature.setId(marker.id);
      this._links.push(feature);
    }
  }
}

export default MarkerManager;