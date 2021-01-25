import DragPan from "ol/interaction/DragPan";
import Overlay from "ol/Overlay";
import VectorLayer from "ol/layer/Vector";
import "ol/ol.css";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Collection from "ol/Collection";
import Feature from "ol/Feature";

import {
  getUnitsSuffix,
  getShortestLineBetweenOverlayAndFeature,
} from "../markers/utils";

const MapEvents = {
  POINTER_MOVE: "pointermove",
  POINTER_UP: "pointerup",
};

class _MarkupManager {
  constructor({
    map,
    source,
    geometries,
    unlinkGeometries = [],
    undraggableGeometries = [],
    formatters,
  } = {}) {
    this._markers = new Map();
    this._listeners = new Map();
    this._links = new Collection([], { unique: true });

    this._unlinkGeometries = unlinkGeometries;
    this._undraggableGeometries = undraggableGeometries;
    this._geometries = geometries;
    this._formatters = formatters;
    this._map = map;
    this._source = source;

    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      .ol-tooltip {
        color: #9ccef9;
        white-space: nowrap;
        font-size: 14px;
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
      style: [
        new Style({
          stroke: new Stroke({
            color: "#9ccef9",
            lineDash: [0.3, 7],
            width: 3,
          }),
        }),
      ],
    });

    const markersOverlay = new Overlay({ element: styleTag });
    this._map.addOverlay(markersOverlay);
    this._map.addLayer(linksVector);

    /** Bind events */
    this._onDrawStart = this._onDrawStart.bind(this);
    this._onDrawEnd = this._onDrawEnd.bind(this);
    this._onTranslateStart = this._onTranslateStart.bind(this);
    this._onModifyStart = this._onModifyStart.bind(this);

    /** Wire interactions events */
    this.wireInteractionsEvents(this._map.getInteractions());
  }

  /**
   * Checks if given link can be created for a given marker.
   *
   * @param {Feature} feature The feature
   * @return {boolean} the validation
   */
  isLinkable(feature) {
    return !this._unlinkGeometries.includes(feature.get("marker"));
  }

  /**
   * Checks if drag is allowed for a given marker.
   *
   * @param {Feature} feature The feature
   * @return {boolean} the validation
   */
  isDraggable(feature) {
    return !this._undraggableGeometries.includes(feature.get("marker"));
  }

  /**
   * Returns a marker
   *
   * @param {string} id The marker id
   * @return {object} The marker
   */
  get(id) {
    return this._markers.get(id);
  }

  /**
   * Removes a marker
   *
   * @param {string} id The marker id
   * @return {string} The marker id
   */
  remove(id) {
    const marker = this.get(id);
    if (!marker) return id;
    const links = this._links.getArray();
    const link = links.find((feature) => feature.getId() === id);
    if (link) this._links.remove(link);
    this._map.removeOverlay(marker.overlay);
    this._markers.delete(id);
    if (this._listeners.get(id)) this._listeners.delete(id);
    return id;
  }

  /**
   * Creates a new marker
   *
   * @param {object} options The options
   * @param {Feature} options.feature The feature to plug the measure marker
   * @param {Feature} options.value The inner content of element
   * @return {object} The marker
   */
  create({ feature, value }) {
    if (!this._isValidFeature(feature)) {
      console.warn("Invalid feature marker:", feature.get("marker"));
      return;
    }

    const id = feature.getId();
    if (!id) {
      console.warn("Failed to create marker, feature with empty id");
      return;
    }

    if (this._markers.has(id)) {
      console.warn("Marker for feature already exists", id);
      return this._markers.get(id);
    }

    const marker = {
      id,
      drawLink: (feature) => this._drawLink(feature, this._markers.get(id)),
    };

    const element = document.createElement("div");
    element.id = this.isDraggable(feature) ? "marker" : "";
    element.className = "ol-tooltip ol-tooltip-measure";
    element.innerText = value ? value : "";

    marker.element = element;
    marker.overlay = new Overlay({
      className: "marker-container",
      positioning: "center-center",
      stopEvent: false,
      dragging: false,
      offset: [7, 7],
      element: marker.element,
    });

    const featureCoordinate = feature.getGeometry().getLastCoordinate();
    marker.overlay.setPosition(featureCoordinate);
    this._drawLink(feature, marker);

    let dragPan;
    let dragProperty = "dragging";
    this._map.getInteractions().forEach((interaction) => {
      if (interaction instanceof DragPan) {
        dragPan = interaction;
      }
    });

    element.addEventListener("mousedown", () => {
      const marker = this._markers.get(id);
      if (marker) {
        dragPan.setActive(false);
        marker.overlay.set(dragProperty, true);
      }
    });

    this._map.on(MapEvents.POINTER_MOVE, (event) => {
      const marker = this._markers.get(id);
      if (
        marker &&
        marker.overlay.get(dragProperty) === true &&
        this.isDraggable(feature)
      ) {
        marker.overlay.setPosition(event.coordinate);
        marker.drawLink(feature);
      }
    });

    this._map.on(MapEvents.POINTER_UP, () => {
      const marker = this._markers.get(id);
      if (
        marker &&
        marker.overlay.get(dragProperty) === true &&
        this.isDraggable(feature)
      ) {
        dragPan.setActive(true);
        marker.overlay.set(dragProperty, false);
      }
    });

    this._map.addOverlay(marker.overlay);
    this._markers.set(id, marker);

    return marker;
  }

  /**
   * Checks if feature has the correct marker
   *
   * @param {Feature} feature The feature
   */
  _isValidFeature(feature) {
    return this._geometries.includes(feature.get("marker"));
  }

  /**
   * Update marker content
   *
   * @param {Feature} feature The feature
   * @param {string} value The marker content
   * @param {string} coordinate The marker coordinate
   */
  updateMarker({ feature, value, coordinate }) {
    const id = feature.getId();

    if (!id) {
      console.warn("Failed attempt to update marker, feature with empty id");
      return;
    }

    const marker = this.get(id);
    if (!marker) {
      console.warn("No marker found for given feature");
      return;
    }

    marker.element.innerText = value;
    if (coordinate) marker.overlay.setPosition(coordinate);
    this._markers.set(id, marker);
  }

  /**
   * Updates marker location on geometry change
   *
   * @param {object} event The event
   */
  _updateMarkerLocation(event) {
    event.features.forEach((feature) => {
      if (this._isValidFeature(feature)) {
        this._updateMarkerOnGeometryChange({
          feature,
          coordinate: event.coordinate,
        });
      }
    });
  }

  /**
   * Get basic metadata of marker
   *
   * @param {Feature} feature The feature
   * @return {object} metadata
   */
  _getMetadata(feature) {
    const id = feature.getId();
    const marker = this.get(id);
    if (marker) {
      return {
        id: marker.id,
        value: marker.element.innerText,
        coordinate: marker.overlay.getPosition(),
      };
    }
  }

  /**
   * This event is responsible assign marker classes
   *
   * @param {object} event The event
   */
  _onDrawEnd(event) {
    const feature = event.feature;
    if (this._isValidFeature(feature)) {
      const featureId = feature.getId();
      const marker = this.get(featureId);
      if (marker) {
        marker.element.className = "ol-tooltip ol-tooltip-static";
        this._markers.set(featureId, marker);
      }
    }
  }

  /**
   * Returns the string format function for a given marker
   *
   * @param {object} feature The feature
   * @returns {function} format function
   */
  _getFormatter(feature) {
    const marker = feature.get("marker");
    const formatter = this._formatters[marker];
    if (!formatter) return () => "";
    return formatter;
  }

  /**
   * Update marker location on geometry change
   *
   * @param {object} feature The feature
   * @param {object} coordinate The marker coordinate
   */
  _updateMarkerOnGeometryChange({ feature, coordinate }) {
    let markerCoordinate = coordinate;
    const featureId = feature.getId();
    const geometry = feature.getGeometry();
    const listener = geometry.on("change", (event) => {
      const marker = this.get(featureId);
      if (marker) {
        let currentGeometry = event.target;
        const view = this._map.getView();
        const unitsSuffix = getUnitsSuffix(view);
        let output = this._getFormatter(feature)(
          feature,
          currentGeometry,
          unitsSuffix
        );
        markerCoordinate = currentGeometry.getLastCoordinate();
        this.updateMarker({
          feature,
          value: output,
          coordinate: markerCoordinate,
        });
        marker.drawLink(feature);
      }
    });
    this._listeners.set(featureId, listener);
  }

  /**
   * Wire interaction events everytime new interactions is added or updated
   *
   * @param {object[]} interactions The map interactions
   */
  wireInteractionsEvents(interactions) {
    if (interactions.draw) {
      this._listeners.set(
        "drawstart",
        interactions.draw.on("drawstart", this._onDrawStart)
      );
      this._listeners.set(
        "drawend",
        interactions.draw.on("drawend", this._onDrawEnd)
      );
    }

    if (interactions.translate) {
      this._listeners.set(
        "translatestart",
        interactions.translate.on("translatestart", this._onTranslateStart)
      );
    }

    if (interactions.modify) {
      this._listeners.set(
        "modifystart",
        interactions.modify.on("modifystart", this._onModifyStart)
      );
    }
  }

  /**
   * Wire interaction events everytime new interactions is added or updated
   *
   * @param {object[]} interactions The map interactions
   */
  onInteractionsChange(interactions) {
    this.wireInteractionsEvents(interactions);
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
      this.create({ feature });
      this._updateMarkerOnGeometryChange({
        feature,
        coordinate: event.coordinate,
      });
    }
  }

  /**
   * Update marker location on translatestart
   *
   * @param {object} event The translatestart event
   */
  _onTranslateStart(event) {
    this._updateMarkerLocation(event);
  }

  /**
   * Update marker location on modifystart
   *
   * @param {object} event The modifystart event
   */
  _onModifyStart(event) {
    this._updateMarkerLocation(event);
  }

  /**
   * Draws a new link feature between marker and feature
   *
   * @param {object} feature The feature
   * @param {object} marker The marker
   */
  _drawLink(feature, marker) {
    if (!this.isLinkable(feature)) return;

    const line = getShortestLineBetweenOverlayAndFeature(
      feature,
      marker.overlay
    );

    const updated = this._links.getArray().some((feature) => {
      if (feature.getId() === marker.id) {
        feature.setGeometry(line);
        return true;
      }
    });

    if (!updated) {
      const feature = new Feature({ geometry: line, name: "Line" });
      feature.setId(marker.id);
      this._links.push(feature);
    }
  }
}

export default _MarkupManager;
