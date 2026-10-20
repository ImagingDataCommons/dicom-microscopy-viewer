import Circle from 'ol/geom/Circle'
import LineString from 'ol/geom/LineString'
import Point from 'ol/geom/Point'
import DragPan from 'ol/interaction/DragPan'
import VectorLayer from 'ol/layer/Vector'
import Overlay from 'ol/Overlay'
import 'ol/ol.css'
import Collection from 'ol/Collection'
import Feature from 'ol/Feature'
import { fromCircle } from 'ol/geom/Polygon'
import { unByKey } from 'ol/Observable'
import VectorSource from 'ol/source/Vector'
import Stroke from 'ol/style/Stroke'
import Style from 'ol/style/Style'

import Enums from '../../enums'
import { coordinateWithOffset } from '../../scoord3dUtils'
import { _getUnitSuffix, _toCssColor } from '../../utils'
import defaultStyles from '../styles'

const DRAG_PROPERTY = 'dragging'
const DRAGGABLE_CLASS = 'markup-label--draggable'
/** Default on-slide measurement label size (px) */
const DEFAULT_MARKUP_LABEL_FONT_SIZE_PX = 13
const MIN_MARKUP_LABEL_FONT_SIZE_PX = 10
const MAX_MARKUP_LABEL_FONT_SIZE_PX = 24
/**
 * Screen-space gap between the ROI tip and the measurement label. Converted to
 * map units with the view resolution so spacing stays readable when zoomed out.
 */
const DEFAULT_MARKUP_LABEL_OFFSET_PX = 36

/**
 * Collect vertex-like coordinates from a geometry for link anchoring.
 *
 * @param {import('ol/geom/Geometry').default} geometry
 * @returns {number[][]}
 *
 * @private
 */
const _geometryAnchorPoints = (geometry) => {
  if (!geometry) return []
  if (geometry instanceof Point) {
    return [geometry.getCoordinates()]
  }
  let geom = geometry
  if (geom instanceof Circle) {
    geom = fromCircle(geom).clone()
  }
  if (typeof geom.getLinearRing === 'function') {
    const ring = geom.getLinearRing(0)
    return ring ? ring.getCoordinates() : []
  }
  if (typeof geom.getCoordinates === 'function') {
    const coords = geom.getCoordinates()
    if (!Array.isArray(coords) || coords.length === 0) return []
    /** LineString: [[x,y], ...]; Multi*: nested — flatten one level when needed */
    if (typeof coords[0] === 'number') return [coords]
    if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
      return coords
    }
    return coords.flatMap((part) =>
      Array.isArray(part) && typeof part[0] === 'number' ? [part] : part,
    )
  }
  return []
}

/**
 * Build a LineString between the overlay and the closest point on the feature.
 *
 * @param {object} feature
 * @param {object} overlay
 * @returns {LineString|undefined}
 *
 * @private
 */
const _getShortestLineBetweenOverlayAndFeature = (feature, overlay) => {
  const overlayPosition = overlay?.getPosition?.()
  if (!overlayPosition) return undefined

  const featureGeometry = feature?.getGeometry?.()
  if (!featureGeometry) return undefined

  let result
  let distanceSq = Infinity

  const tryPair = (a, b) => {
    const d = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
    if (d < distanceSq) {
      distanceSq = d
      result = [a, b]
    }
  }

  for (const point of _geometryAnchorPoints(featureGeometry)) {
    if (!Array.isArray(point) || point.length < 2) continue
    tryPair(point, overlayPosition)
  }

  let geomForClosest = featureGeometry
  if (geomForClosest instanceof Circle) {
    geomForClosest = fromCircle(geomForClosest).clone()
  }
  if (typeof geomForClosest.getClosestPoint === 'function') {
    const closest = geomForClosest.getClosestPoint(overlayPosition)
    if (Array.isArray(closest) && closest.length >= 2) {
      tryPair(closest, overlayPosition)
    }
  }

  if (!result) return undefined
  return new LineString(result)
}

class _MarkupManager {
  constructor({ map, pyramid, affine, drawingSource, formatters } = {}) {
    this._map = map
    this._pyramid = pyramid
    this._affine = affine
    this._formatters = formatters || {}
    this._drawingSource = drawingSource

    this._markups = new Map()
    /** @type {Map<string, { featureChange?: object, propertyChange?: object, geometryChange?: object, mouseDown?: Function }>} */
    this._listeners = new Map()
    this._links = new Collection([], { unique: true })
    /** @type {Map<string, Feature>} */
    this._linksById = new Map()
    /** @type {'μm'|'mm'|undefined} */
    this._measurementUnit = undefined
    this._getMeasurementUnit = undefined
    /** @type {string|number[]|undefined} */
    this._markupLabelColor = undefined
    /** @type {number|undefined} Font size in px; undefined uses the library default */
    this._markupLabelFontSize = undefined
    /** @type {string|undefined} Id of the markup currently being dragged */
    this._activeDragId = undefined
    this._destroyed = false

    this._styleTag = document.createElement('style')
    this._styleTag.innerHTML = this._getTooltipStyles()

    this._linksVector = new VectorLayer({
      source: new VectorSource({ features: this._links }),
    })

    this._markupsOverlay = new Overlay({ element: this._styleTag })
    this._map.addOverlay(this._markupsOverlay)
    this._map.addLayer(this._linksVector)

    this._pointerMoveKey = this._map.on(Enums.MapEvents.POINTER_MOVE, (event) =>
      this._onMapPointerMove(event),
    )
    this._pointerUpKey = this._map.on(Enums.MapEvents.POINTER_UP, () =>
      this._onMapPointerUp(),
    )
  }

  /**
   * Find the map DragPan interaction, if any.
   *
   * @returns {DragPan|undefined}
   */
  _getDragPan() {
    let dragPan
    this._map.getInteractions().forEach((interaction) => {
      if (interaction instanceof DragPan) {
        dragPan = interaction
      }
    })
    return dragPan
  }

  _onMapPointerMove(event) {
    const id = this._activeDragId
    if (id == null) return
    const markup = this.get(id)
    if (!markup?.isDraggable) return
    markup.overlay.setPosition(event.coordinate)
    const feature = this._drawingSource?.getFeatureById(id)
    if (feature) this._drawLink(feature)
  }

  _onMapPointerUp() {
    const id = this._activeDragId
    if (id == null) return
    const markup = this.get(id)
    this._activeDragId = undefined
    this._getDragPan()?.setActive(true)
    if (markup) {
      markup.overlay.set(DRAG_PROPERTY, false)
      /** Keep the dragged position; do not snap back to the tip on geometry updates */
      markup.userMoved = true
    }
  }

  /**
   * Unsubscribe and drop listener bookkeeping for one markup.
   *
   * @param {string} id
   * @returns {void}
   */
  _unwireInternalEvents(id) {
    const entry = this._listeners.get(id)
    if (!entry) return
    if (entry.featureChange) unByKey(entry.featureChange)
    if (entry.propertyChange) unByKey(entry.propertyChange)
    if (entry.geometryChange) unByKey(entry.geometryChange)
    if (entry.mouseDown) {
      const markup = this.get(id)
      markup?.element?.removeEventListener(
        Enums.HTMLElementEvents.MOUSE_DOWN,
        entry.mouseDown,
      )
    }
    this._listeners.delete(id)
  }

  /**
   * Set markups visibility.
   *
   * @param {boolean} isVisible
   * @returns {void}
   */
  setVisible(isVisible) {
    this._linksVector.setVisible(isVisible)
    this._markups.forEach((markup) => {
      if (isVisible) {
        if (!markup.overlay.getMap()) {
          this._map.addOverlay(markup.overlay)
        }
        markup.element.style.display = ''
      } else {
        this._map.removeOverlay(markup.overlay)
        markup.element.style.display = 'none'
      }
    })
  }

  /**
   * Checks whether a markup exists.
   *
   * @param {string} id The markup id
   * @return {boolean}
   */
  has(id) {
    return this._markups.has(id)
  }

  /**
   * Returns a markup
   *
   * @param {string} id The markup id
   * @return {object} The markup
   */
  get(id) {
    return this._markups.get(id)
  }

  /**
   * Removes a markup and its link.
   *
   * @param {string} id The markup id
   * @return {string} The markup id
   */
  remove(id) {
    const markup = this.get(id)
    if (!markup) {
      return id
    }

    if (this._activeDragId === id) {
      this._activeDragId = undefined
      this._getDragPan()?.setActive(true)
    }

    this._unwireInternalEvents(id)

    const link = this._linksById.get(id)
    if (link) {
      this._links.remove(link)
      this._linksById.delete(id)
    }

    this._map.removeOverlay(markup.overlay)
    this._markups.delete(id)

    return id
  }

  /**
   * Tear down every markup, map listeners, overlays, and the link layer.
   *
   * @returns {void}
   */
  destroy() {
    if (this._destroyed) return
    this._destroyed = true

    const ids = [...this._markups.keys()]
    for (const id of ids) {
      this.remove(id)
    }

    if (this._pointerMoveKey) {
      unByKey(this._pointerMoveKey)
      this._pointerMoveKey = undefined
    }
    if (this._pointerUpKey) {
      unByKey(this._pointerUpKey)
      this._pointerUpKey = undefined
    }

    if (this._markupsOverlay) {
      this._map.removeOverlay(this._markupsOverlay)
      this._markupsOverlay = undefined
    }
    if (this._linksVector) {
      this._map.removeLayer(this._linksVector)
      this._linksVector.getSource()?.clear()
      this._linksVector = undefined
    }
    this._styleTag = undefined
    this._linksById.clear()
    this._listeners.clear()
    this._markups.clear()
  }

  /**
   * Set markup visibility.
   *
   * @param {string} id The markup id
   * @param {boolean} isVisible The markup visibility
   */
  setVisibility(id, isVisible) {
    const markup = this.get(id)
    if (!markup) {
      return
    }

    const feature = this._drawingSource?.getFeatureById(id)
    const link = this._linksById.get(id)

    if (!isVisible) {
      this._map.removeOverlay(markup.overlay)
      markup.element.style.display = 'none'
      if (link) {
        this._links.remove(link)
        this._linksById.delete(id)
      }
    } else {
      markup.element.style.display = ''
      if (!markup.overlay.getMap()) {
        this._map.addOverlay(markup.overlay)
      }
      if (feature) {
        this._drawLink(feature)
      }
    }

    return isVisible
  }

  /**
   * Tip coordinate shifted by {@link DEFAULT_MARKUP_LABEL_OFFSET_PX} in screen
   * space (map units via view resolution).
   *
   * @param {Feature} feature
   * @returns {number[]|undefined}
   */
  _offsetCoordinate(feature) {
    const geometry = feature?.getGeometry?.()
    if (!geometry?.getLastCoordinate) return undefined
    const resolution = this._map.getView()?.getResolution() ?? 1
    return coordinateWithOffset(
      feature,
      DEFAULT_MARKUP_LABEL_OFFSET_PX * resolution,
    )
  }

  /**
   * Creates a new markup
   *
   * @param {object} options The options
   * @param {Feature} options.feature The feature to plug the measure markup
   * @param {string} options.value The inner content of element
   * @param {boolean} options.isLinkable Create a link between feature and markup
   * @param {boolean} options.isDraggable Allow markup to be dragged
   * @return {object} The markup object
   */
  create({ feature, value = '', isLinkable = true, isDraggable = true }) {
    if (this._destroyed) return undefined

    const id = feature.getId()
    if (!id) {
      console.warn('Failed to create markup, feature id not found')
      return
    }

    if (this.has(id)) {
      console.warn('Markup for feature already exists', id)
      this._drawLink(feature)
      this._wireInternalEvents(feature)
      this._styleTooltip(feature)
      return this.get(id)
    }

    const markup = { id, isLinkable, isDraggable, feature, userMoved: false }

    const element = document.createElement('div')
    element.className = 'ol-tooltip ol-tooltip-measure'
    if (isDraggable) {
      element.classList.add(DRAGGABLE_CLASS)
    }
    element.innerText = value

    markup.element = element
    markup.overlay = new Overlay({
      className: 'markup-container',
      positioning: 'center-center',
      stopEvent: false,
      dragging: false,
      position: this._offsetCoordinate(feature),
      element: markup.element,
    })

    this._map.addOverlay(markup.overlay)
    this._markups.set(id, markup)

    this._drawLink(feature)
    this._wireInternalEvents(feature)
    this._styleTooltip(feature)

    return markup
  }

  /**
   * Wire internal events to markup feature (idempotent).
   *
   * @param {object} feature
   * @returns {void}
   */
  _wireInternalEvents(feature) {
    const id = feature.getId()
    const markup = this.get(id)
    if (!markup) return

    this._unwireInternalEvents(id)

    const featureChange = feature.on(Enums.FeatureEvents.CHANGE, (event) => {
      if (!this.has(id)) return
      const current = this.get(id)
      const view = this._map.getView()
      const unitSuffix = _getUnitSuffix(
        view,
        this._getMeasurementUnit?.() ?? this._measurementUnit,
      )
      const format = this._getFormatter(event.target)
      const output = format(
        event.target,
        unitSuffix,
        this._pyramid,
        this._affine,
      )
      /**
       * Keep a screen-space gap from the tip while drawing / editing. Only skip
       * when the user has dragged the label (otherwise CHANGE snapped it back
       * onto the measurement).
       */
      this.update({
        feature,
        value: output,
        coordinate: current?.userMoved
          ? undefined
          : this._offsetCoordinate(event.target),
      })
      this._drawLink(feature)
    })

    const propertyChange = feature.on(
      Enums.FeatureEvents.PROPERTY_CHANGE,
      ({ key: property, target: changedFeature }) => {
        if (property === Enums.InternalProperties.StyleOptions) {
          this._styleTooltip(changedFeature)
        }
      },
    )

    const geometry = feature.getGeometry()
    const geometryChange = geometry
      ? geometry.on(Enums.FeatureGeometryEvents.CHANGE, () => {
          this._styleTooltip(feature)
        })
      : undefined

    const mouseDown = () => {
      const current = this.get(id)
      if (!current?.isDraggable) return
      this._getDragPan()?.setActive(false)
      current.overlay.set(DRAG_PROPERTY, true)
      this._activeDragId = id
    }
    markup.element.addEventListener(
      Enums.HTMLElementEvents.MOUSE_DOWN,
      mouseDown,
    )

    this._listeners.set(id, {
      featureChange,
      propertyChange,
      geometryChange,
      mouseDown,
    })

    this._styleTooltip(feature)
  }

  onDrawAbort({ feature }) {
    const id = feature?.getId?.()
    if (id != null) this.remove(id)
  }

  /**
   * Color for the measurement label and dotted link: host preference, else ROI
   * stroke, else the library default.
   *
   * @param {object} feature
   * @returns {string|number[]}
   */
  _resolveMarkupColor(feature) {
    if (this._markupLabelColor != null && this._markupLabelColor !== '') {
      return this._markupLabelColor
    }
    const styleOptions = feature.get(Enums.InternalProperties.StyleOptions)
    return styleOptions?.stroke?.color || defaultStyles.stroke.color
  }

  /**
   * Apply CSS color to a dotted link feature (new Style so OL repaints).
   *
   * @param {Feature} link
   * @param {string} cssColor
   * @returns {void}
   */
  _setLinkColor(link, cssColor) {
    link.setStyle(
      new Style({
        stroke: new Stroke({
          color: cssColor,
          lineDash: [0.3, 7],
          width: 3,
        }),
      }),
    )
  }

  /**
   * Apply resolved color to the label element and its link.
   *
   * @param {string} id
   * @param {string} cssColor
   * @returns {void}
   */
  _applyMarkupColor(id, cssColor) {
    const marker = this.get(id)
    if (marker?.element) {
      /**
       * setProperty with important beats inherited viewport / Tailwind base
       * colors that otherwise leave the measurement value looking unchanged.
       */
      marker.element.style.setProperty('color', cssColor, 'important')
      /** OL wraps the tooltip in an overlay container — color that too */
      const container = marker.element.parentElement
      if (container) {
        container.style.setProperty('color', cssColor, 'important')
      }
    }
    const link = this._linksById.get(id)
    if (link) {
      this._setLinkColor(link, cssColor)
      link.changed?.()
    }
  }

  /**
   * Updates the feature's markup tooltip style.
   *
   * @param {object} feature
   * @returns {void}
   */
  _styleTooltip(feature) {
    if (!feature) return
    const id = feature.getId()
    if (id == null) return
    const tooltipColor = _toCssColor(
      this._resolveMarkupColor(feature),
      defaultStyles.stroke.color,
    )
    this._applyMarkupColor(id, tooltipColor)
  }

  /**
   * Recompute measurement label text for every active markup (after unit change).
   *
   * @returns {void}
   */
  refreshMeasurementMarkups() {
    if (!this._map || this._destroyed) return
    const view = this._map.getView()
    const unitSuffix = _getUnitSuffix(
      view,
      this._getMeasurementUnit?.() ?? this._measurementUnit,
    )
    this._markups.forEach((markup, id) => {
      const feature = markup.feature || this._drawingSource?.getFeatureById(id)
      if (!feature) return
      markup.feature = feature
      if (
        feature.get(Enums.InternalProperties.Markup) !==
        Enums.Markup.Measurement
      ) {
        return
      }
      const format = this._getFormatter(feature)
      const output = format(feature, unitSuffix, this._pyramid, this._affine)
      this.update({
        feature,
        value: output,
      })
    })
  }

  /**
   * Re-apply label / link colors for every active markup.
   * Uses the stored feature ref when the sketch is not yet on drawingSource
   * (OpenLayers Draw keeps it on the interaction overlay until drawend).
   *
   * @returns {void}
   */
  refreshMarkupStyles() {
    if (this._destroyed) return
    this._markups.forEach((markup, id) => {
      const feature = markup.feature || this._drawingSource?.getFeatureById(id)
      if (feature) {
        markup.feature = feature
        this._styleTooltip(feature)
        return
      }
      /**
       * Host label color does not need the feature; still paint the element
       * and link so preference changes apply during an in-progress draw.
       */
      if (this._markupLabelColor != null && this._markupLabelColor !== '') {
        this._applyMarkupColor(
          id,
          _toCssColor(this._markupLabelColor, defaultStyles.stroke.color),
        )
      }
    })
  }

  /**
   * Preferred measurement unit for markup labels (`μm` / `mm`), or undefined
   * to pick automatically from the view scale.
   *
   * @param {'μm'|'mm'|undefined} unit
   * @returns {void}
   */
  setMeasurementUnit(unit) {
    this._measurementUnit = unit
    this.refreshMeasurementMarkups()
  }

  /**
   * Optional getter used when the host keeps the preferred unit on the viewer.
   *
   * @param {Function|undefined} getter
   * @returns {void}
   */
  setMeasurementUnitGetter(getter) {
    this._getMeasurementUnit = getter
  }

  /**
   * Preferred color for measurement labels and dotted link lines.
   *
   * @param {string|number[]|undefined} color
   * @returns {void}
   */
  setMarkupLabelColor(color) {
    this._markupLabelColor = color == null || color === '' ? undefined : color
    this.refreshMarkupStyles()
  }

  /**
   * Font size (px) for measurement / text markup labels. Pass empty / null /
   * undefined to restore the library default (13px).
   *
   * @param {number|string|undefined|null} size
   * @returns {void}
   */
  setMarkupLabelFontSize(size) {
    if (size == null || size === '') {
      this._markupLabelFontSize = undefined
    } else {
      const n = typeof size === 'number' ? size : Number(size)
      if (!Number.isFinite(n)) return
      this._markupLabelFontSize = Math.min(
        MAX_MARKUP_LABEL_FONT_SIZE_PX,
        Math.max(MIN_MARKUP_LABEL_FONT_SIZE_PX, Math.round(n)),
      )
    }
    if (this._styleTag) {
      this._styleTag.innerHTML = this._getTooltipStyles()
    }
  }

  /**
   * @returns {number}
   */
  getMarkupLabelFontSize() {
    return this._markupLabelFontSize ?? DEFAULT_MARKUP_LABEL_FONT_SIZE_PX
  }

  /**
   * Layout styles shared by all markup tooltips (color is per-element inline).
   *
   * @returns {string}
   */
  _getTooltipStyles() {
    const fontSizePx = this.getMarkupLabelFontSize()
    return `
      .ol-tooltip {
        white-space: nowrap;
        font-size: ${fontSizePx}px;
        font-weight: bold;
      }
      .ol-tooltip-measure { opacity: 1; }
      .ol-tooltip-measure:before,
      .ol-tooltip-static:before {
        content: '';
      }

      .${DRAGGABLE_CLASS} { cursor: move; }
      .markup-container { display: block !important; }
    `
  }

  /**
   * Checks if feature has the correct markup.
   *
   * @param {Feature} feature The feature
   */
  _isValidFeature(feature) {
    return Object.values(Enums.Markup).includes(
      feature.get(Enums.InternalProperties.Markup),
    )
  }

  /**
   * Update markup content.
   *
   * @param {object} options
   * @param {Feature} options.feature The markup feature
   * @param {string} [options.value] The markup content
   * @param {number[]} [options.coordinate] The markup coordinate
   */
  update({ feature, value, coordinate }) {
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

    if (value != null) {
      markup.element.innerText = value
    }

    if (coordinate != null) {
      markup.overlay.setPosition(coordinate)
    }
  }

  /**
   * Assign static tooltip classes on drawEnd.
   *
   * @param {object} event The event
   */
  onDrawEnd(event) {
    const feature = event.feature
    if (this._isValidFeature(feature)) {
      const featureId = feature.getId()
      const markup = this.get(featureId)
      if (markup) {
        markup.feature = feature
        const draggable = markup.isDraggable ? ` ${DRAGGABLE_CLASS}` : ''
        markup.element.className = `ol-tooltip ol-tooltip-static${draggable}`
        /** className reset can drop cascade; re-assert label/link color */
        this._styleTooltip(feature)
      }
    }
  }

  /**
   * Assign static tooltip classes on update.
   *
   * @param {object} feature
   */
  onUpdate(feature) {
    if (this._isValidFeature(feature)) {
      const featureId = feature.getId()
      const markup = this.get(featureId)
      if (markup) {
        markup.feature = feature
        const draggable = markup.isDraggable ? ` ${DRAGGABLE_CLASS}` : ''
        markup.element.className = `ol-tooltip ol-tooltip-static${draggable}`
        this._styleTooltip(feature)
      }
    }
  }

  /**
   * Returns the string format function for a given markup.
   *
   * @param {object} feature The feature
   * @returns {function} format function
   */
  _getFormatter(feature) {
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
  _drawLink(feature) {
    const id = feature.getId()
    const markup = this.get(id)
    if (!markup?.isLinkable) {
      return
    }

    const line = _getShortestLineBetweenOverlayAndFeature(
      feature,
      markup.overlay,
    )
    if (!line) return

    const existing = this._linksById.get(markup.id)
    if (existing) {
      existing.setGeometry(line)
      return
    }

    const linkFeature = new Feature({ geometry: line, name: 'Line' })
    linkFeature.setId(markup.id)
    const linkColor = _toCssColor(
      this._resolveMarkupColor(feature),
      defaultStyles.stroke.color,
    )
    this._setLinkColor(linkFeature, linkColor)
    this._links.push(linkFeature)
    this._linksById.set(markup.id, linkFeature)
  }
}

export default _MarkupManager
