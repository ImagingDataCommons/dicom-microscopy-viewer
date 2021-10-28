import DragPan from 'ol/interaction/DragPan'
import Overlay from 'ol/Overlay'
import VectorLayer from 'ol/layer/Vector'
import 'ol/ol.css'
import VectorSource from 'ol/source/Vector'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Collection from 'ol/Collection'
import Feature from 'ol/Feature'

import Enums from '../../enums'
import { getShortestLineBetweenOverlayAndFeature } from './utils'
import { getUnitSuffix } from '../../utils'
import { coordinateWithOffset } from '../../scoord3dUtils'
import defaultStyles from '../styles'

const DEFAULT_MARKUP_OFFSET = 2;

class _MarkupManager {
  constructor ({ map, pyramid, drawingSource, formatters, onClick, onStyle } = {}) {
    this._map = map
    this._pyramid = pyramid
    this._formatters = formatters
    this._drawingSource = drawingSource;

    this.onClick = onClick
    this.onStyle = onStyle

    this._markups = new Map()
    this._listeners = new Map()
    this._links = new Collection([], { unique: true })

    const defaultColor = defaultStyles.stroke.color
    this._styleTag = document.createElement('style')
    this._styleTag.innerHTML = this._getTooltipStyles(defaultColor)

    this._linksVector = new VectorLayer({
      source: new VectorSource({ features: this._links })
    })

    this._markupsOverlay = new Overlay({ element: this._styleTag, stopEvent: true })
    this._map.addOverlay(this._markupsOverlay)
    this._map.addLayer(this._linksVector)
  }

  /**
   * Set markups visibility.
   *
   * @param {boolean} isVisible
   * @returns {void}
   */
  setVisible (isVisible) {
    this._linksVector.setVisible(isVisible)

    if (isVisible) {
      this._markups.forEach((markup) => {
        this._map.removeOverlay(markup.overlay)
        this._map.addOverlay(markup.overlay)
      })
      return
    }

    this._markups.forEach((markup) => {
      this._map.addOverlay(markup.overlay)
      this._map.removeOverlay(markup.overlay)
    })
  }

  /**
   * Checks whether a markup exists.
   *
   * @param {string} id The markup id
   * @return {boolean}
   */
  has (id) {
    return this._markups.has(id)
  }

  /**
   * Returns a markup
   *
   * @param {string} id The markup id
   * @return {object} The markup
   */
  get (id) {
    return this._markups.get(id)
  }

  /**
   * Returns all markup overlays
   *
   * @return {array} The markup overlays
   */
  getOverlays() {
    return Array.from(this._markups.values()).map(v => v.overlay);
  }

  /**
   * Removes a markup and its link.
   *
   * @param {string} id The markup id
   * @return {string} The markup id
   */
  remove (id) {
    const markup = this.get(id)
    if (!markup) {
      return id
    }

    const links = this._links.getArray()
    const link = links.find((feature) => feature.getId() === id)
    if (link) {
      this._links.remove(link)
    }

    this._map.removeOverlay(markup.overlay)
    this._markups.delete(id)

    if (this._listeners.get(id)) {
      this._listeners.delete(id)
    }

    return id
  }

  /**
   * Update feature's presentation state property.
   *
   * @param {object} options
   */
  updatePresentationState({ feature, coordinates }) {
    feature.set(Enums.InternalProperties.PresentationState, {
      markup: {
        coordinates,
      },
    });
  }

  /* Set markup visibility.
   *
   * @param {string} id The markup id
   * @param {boolean} isVisible The markup visibility
   */
  setVisibility (id, isVisible) {
    const markup = this.get(id)
    if (!markup) {
      return;
    }

    const links = this._links.getArray()
    const link = links.find((feature) => feature.getId() === id)

    const feature = this._drawingSource.getFeatureById(id);

    if (!isVisible) {
      this._map.removeOverlay(markup.overlay)
      this._links.remove(link)
    } else {
      this._map.addOverlay(markup.overlay)
      this._drawLink(feature)
    }

    return isVisible
  }

  /**
   * Creates a new markup
   *
   * @param {object} options The options
   * @param {Feature} options.feature The feature to plug the measure markup
   * @param {Style} options.style A custom style
   * @param {string} options.value The inner content of element
   * @param {string} options.position The position
   * @param {boolean} options.isLinkable Create a link between feature and markup
   * @param {boolean} options.isDraggable Allow markup to be dragged
   * @param {array} offset Markup offset
   * @return {object} The markup object
   */
  create({
    feature,
    style,
    value = "",
    position,
    isLinkable = true,
    isDraggable = true,
  }) {
    const id = feature.getId();
    if (!id) {
      console.warn('Failed to create markup, feature id not found')
      return
    }

    if (this.has(id)) {
      console.warn('Markup for feature already exists', id)
      return this.get(id)
    }

    const markup = { id, isLinkable, isDraggable, style }

    const element = document.createElement('div')
    element.id = markup.isDraggable ? Enums.InternalProperties.Markup : ''
    element.className = 'ol-tooltip ol-tooltip-measure'
    element.innerText = value

    const spacedCoordinate = coordinateWithOffset(feature, DEFAULT_MARKUP_OFFSET, this._map)

    element.onpointerdown = event => {
      event.stopPropagation();
    }

    markup.element = element
    markup.overlay = new Overlay({
      className: 'markup-container',
      positioning: 'center-center',
      stopEvent: true,
      dragging: false,
      position: position || spacedCoordinate,
      element: markup.element,
    });

    this.updatePresentationState({
      feature,
      coordinates: position || spacedCoordinate,
    });

    this._map.addOverlay(markup.overlay);
    this._markups.set(id, markup);

    this._drawLink(feature)
    this._wireInternalEvents(feature)

    const isVisible = this._linksVector.getVisible();
    this.setVisible(isVisible);

    return markup;
  }

  /**
   * Wire internal events to markup feature.
   *
   * @param {object} feature
   * @returns {void}
   */
  _wireInternalEvents (feature) {
    const id = feature.getId()
    const markup = this.get(id)
    const geometry = feature.getGeometry()
    const listener = geometry.on(
      Enums.FeatureGeometryEvents.CHANGE,
      ({ target: geometry }) => {
        if (this.has(id)) {
          const { isShortAxis, isLongAxis } = feature.getProperties();
          if (isShortAxis, isLongAxis) {
            return;
          }

          const view = this._map.getView()
          const unitSuffix = getUnitSuffix(view)
          const format = this._getFormatter(feature)
          const output = format(feature, unitSuffix, this._pyramid)
          this.update({
            feature,
            value: output,
            coordinate: geometry.getLastCoordinate()
          })
        }
      }
    )
    this._listeners.set(id, listener)

    this._styleTooltip(feature)

    /** Keep markup style after external style changes */
    feature.on(
      Enums.FeatureEvents.PROPERTY_CHANGE,
      ({ key: property, target: feature }) => {
        if (property === Enums.InternalProperties.StyleOptions) {
          this._styleTooltip(feature)
        }
      }
    )

    /** Update markup style on feature geometry change */
    feature.getGeometry().on(Enums.FeatureGeometryEvents.CHANGE, () => {
      this._styleTooltip(feature)
    })

    let dragPan
    const dragProperty = 'dragging'
    this._map.getInteractions().forEach((interaction) => {
      if (interaction instanceof DragPan) {
        dragPan = interaction
      }
    })

    markup.element.addEventListener(Enums.HTMLElementEvents.MOUSE_DOWN, () => {
      const markup = this.get(id)
      if (markup) {
        dragPan.setActive(false)
        markup.overlay.set(dragProperty, true)
      }
    })

    this._map.on(Enums.MapEvents.POINTER_MOVE, (event) => {
      const markup = this.get(id)
      if (
        markup &&
        markup.overlay.get(dragProperty) === true &&
        markup.isDraggable
      ) {
        /** Doesn't need to have the offset */
        markup.overlay.setPosition(event.coordinate);
        this.updatePresentationState({
          feature,
          coordinates: event.coordinate,
        });
        this._drawLink(feature);
      }
    })

    markup.element.addEventListener(Enums.HTMLElementEvents.MOUSE_UP, () => { 
      const markup = this.get(id)
      if (
        markup &&
        markup.overlay.get(dragProperty) === true &&
        markup.isDraggable
      ) {
        dragPan.setActive(true)
        markup.overlay.set(dragProperty, false)
      }
    });
  }

  onDrawAbort ({ feature }) {
    this.remove(feature.getId())
  }

  /**
   * Updates the feature's markup tooltip style.
   *
   * @param {object} feature
   * @returns {void}
   */
  _styleTooltip (feature) {
    const marker = this.get(feature.getId());
    const styleOptions = marker && marker.style !== undefined ? marker.style : feature.get(Enums.InternalProperties.StyleOptions)
    if (styleOptions && styleOptions.stroke) {
      const { color } = styleOptions.stroke
      const tooltipColor = color || defaultStyles.stroke.color
      const links = this._links.getArray()
      const link = links.find((link) => link.getId() === feature.getId())
      if (link) {
        const styles = link.getStyle()
        const stroke = styles.getStroke()
        stroke.setColor(tooltipColor)
        styles.setStroke(stroke)
        link.setStyle(styles)
      }
      if (marker) {
        marker.element.style.color = tooltipColor
      }
      /**
       * This is necessary to resolve intermediary error:
       * 'Two axis of Ellipse must have right angle'
       * 
       * TODO: Resolve core problem.
       */
      feature.changed();
    }
  }

  /**
   * Returns tooltip styles.
   *
   * @param {string} color
   */
  _getTooltipStyles (color) {
    return `
      .ol-tooltip {
        color: ${color};
        white-space: nowrap;
        font-size: 17px;
        font-weight: bold;
        text-shadow: 0px 0px 20px rgba(225,225,225,0.6),
        0px 0px 20px rgb(225 225 225 / 60%),
        0px 0px 20px rgb(225 225 225 / 60%),
        0px 0px 20px rgb(225 225 225 / 60%),
        0px 0px 20px rgb(225 225 225 / 60%),
        0px 0px 20px rgb(225 225 225 / 60%),
        0px 0px 20px rgb(225 225 225 / 60%);
      }
      .ol-tooltip-measure { opacity: 1; }
      .ol-tooltip-static { color: ${color}; }
      .ol-tooltip-measure:before,
      .ol-tooltip-static:before {
        content: '',
      }

      #markup { cursor: move; }
      .markup-container { display: block !important; }
    `
  }

  /**
   * Checks if feature has the correct markup.
   *
   * @param {Feature} feature The feature
   */
  _isValidFeature (feature) {
    return Object.values(Enums.Markup).includes(
      feature.get(Enums.InternalProperties.Markup)
    )
  }

  /**
   * Update markup content.
   *
   * @param {object} markup The markup properties
   * @param {Feature} markup.feature The markup feature
   * @param {string} markup.value The markup content
   * @param {string} markup.coordinate The markup coordinate
   */
  update ({ feature, value, coordinate }) {
    const id = feature.getId()

    if (!id) {
      console.warn('Failed attempt to update markup, feature with empty id')
      return
    }

    const markup = this.get(id)
    if (!markup) {
      console.warn('No markup found for given feature')
      return
    }

    if (value) {
      markup.element.innerText = value
    }

    if (coordinate) {
      const padding = (markup.element.offsetWidth + markup.element.offsetHeight) / 2;
      markup.overlay.setPosition(coordinateWithOffset(feature, DEFAULT_MARKUP_OFFSET + padding, this._map))
    }

    this._markups.set(id, markup)
    this._drawLink(feature)
  }

  /**
   * This event is responsible assign markup classes on drawEnd event
   *
   * @param {object} event The event
   */
  onDrawEnd (event) {
    const feature = event.feature
    if (this._isValidFeature(feature)) {
      const featureId = feature.getId()
      const markup = this.get(featureId)
      if (markup) {
        markup.element.className = 'ol-tooltip ol-tooltip-static'
        this._markups.set(featureId, markup)
      }
    }
  }

  /**
   * Returns the string format function for a given markup.
   *
   * @param {object} feature The feature
   * @returns {function} format function
   */
  _getFormatter (feature) {
    const markup = feature.get(Enums.InternalProperties.Markup)
    const formatter = this._formatters[markup]
    if (!formatter) return () => ''
    return formatter
  }

  /**
   * Draws a link between the feature and the markup.
   *
   * @param {object} feature The feature
   */
  _drawLink (feature) {
    const markup = this.get(feature.getId())
    if (!markup || !markup.isLinkable) {
      return
    }

    const line = getShortestLineBetweenOverlayAndFeature(
      feature,
      markup.overlay
    )

    const updated = this._links.getArray().some((feature) => {// eslint-disable-line
      if (feature.getId() === markup.id) {
        feature.setGeometry(line)
        return true
      }
    })

    if (!updated) {
      const feature = new Feature({ geometry: line, name: 'Line' })
      feature.setId(markup.id)
      feature.setStyle(
        new Style({
          stroke: new Stroke({
            color: defaultStyles.stroke.color,
            lineDash: [0.3, 7],
            width: 3
          })
        })
      )
      this._links.push(feature)
    }
  }
}

export default _MarkupManager
