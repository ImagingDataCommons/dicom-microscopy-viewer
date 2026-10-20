import dcmjs from 'dcmjs'
/** Enums */
import Enums from '../enums'
/** Utils */
import {
  _normalizeMeasurementUnit,
  areCodedConceptsEqual,
  getContentItemNameCodedConcept,
} from '../utils'

/** Markers */
import ArrowMarker, { _format as arrowFormat } from './markers/arrow'
import _MarkupManager from './markups/_MarkupManager'
/** Markups */
import MeasurementMarkup, {
  _format as measurementFormat,
} from './markups/measurement'
import TextEvaluationMarkup, {
  _format as textFormat,
} from './markups/textEvaluation'

const { Marker, Markup } = Enums

class _AnnotationManager {
  constructor({ map, pyramid, affine, drawingSource } = {}) {
    const markupManager = new _MarkupManager({
      map,
      pyramid,
      affine,
      drawingSource,
      formatters: {
        [Marker.Arrow]: arrowFormat,
        [Markup.Measurement]: measurementFormat,
        [Markup.TextEvaluation]: textFormat,
      },
    })

    /** @type {'μm'|'mm'|undefined} */
    this._measurementUnit = undefined
    /** @type {string|number[]|undefined} */
    this._markupLabelColor = undefined
    /** @type {number|undefined} */
    this._markupLabelFontSize = undefined

    this.props = {
      map,
      pyramid,
      affine,
      markupManager,
      getMeasurementUnit: () => this._measurementUnit,
    }

    if (typeof markupManager.setMeasurementUnitGetter === 'function') {
      markupManager.setMeasurementUnitGetter(() => this._measurementUnit)
    }

    /** Markups */
    this[Markup.Measurement] = MeasurementMarkup(this.props)
    this[Markup.TextEvaluation] = TextEvaluationMarkup(this.props)

    /** Markers */
    this[Marker.Arrow] = ArrowMarker(this.props)
  }

  /**
   * Preferred measurement unit for on-slide labels and ROI NumContentItems.
   *
   * @param {string|undefined|null} unit - `µm` / `μm` / `mm`, or empty for auto
   * @returns {void}
   */
  setMeasurementUnit(unit) {
    this._measurementUnit = _normalizeMeasurementUnit(unit)
    if (typeof this.props.markupManager.setMeasurementUnit === 'function') {
      this.props.markupManager.setMeasurementUnit(this._measurementUnit)
    }
  }

  /**
   * @returns {'μm'|'mm'|undefined}
   */
  getMeasurementUnit() {
    return this._measurementUnit
  }

  /**
   * Preferred color for measurement labels and their dotted link lines.
   *
   * @param {string|number[]|undefined|null} color
   * @returns {void}
   */
  setMarkupLabelColor(color) {
    if (color == null || color === '') {
      this._markupLabelColor = undefined
    } else {
      this._markupLabelColor = color
    }
    if (typeof this.props.markupManager.setMarkupLabelColor === 'function') {
      this.props.markupManager.setMarkupLabelColor(this._markupLabelColor)
    }
  }

  /**
   * @returns {string|number[]|undefined}
   */
  getMarkupLabelColor() {
    return this._markupLabelColor
  }

  /**
   * Preferred font size (px) for measurement / text markup labels.
   *
   * @param {number|string|undefined|null} size
   * @returns {void}
   */
  setMarkupLabelFontSize(size) {
    if (size == null || size === '') {
      this._markupLabelFontSize = undefined
    } else {
      const n = typeof size === 'number' ? size : Number(size)
      this._markupLabelFontSize = Number.isFinite(n) ? n : undefined
    }
    if (typeof this.props.markupManager.setMarkupLabelFontSize === 'function') {
      this.props.markupManager.setMarkupLabelFontSize(this._markupLabelFontSize)
    }
  }

  /**
   * @returns {number|undefined}
   */
  getMarkupLabelFontSize() {
    return this._markupLabelFontSize
  }

  /**
   * Add markup properties based on ROI
   * measurements and evaluations.
   *
   * @param {Feature} feature The feature
   */
  _addMeasurementsAndEvaluationsProperties(feature) {
    const { measurements, evaluations } = feature.getProperties()

    if (measurements?.length) {
      return measurements.some((measurement) => {
        // eslint-disable-line
        const SUPPORTED_MEASUREMENTS_CODED_CONCEPTS = [
          new dcmjs.sr.coding.CodedConcept({
            meaning: 'Area',
            value: '42798000',
            schemeDesignator: 'SCT',
          }),
          new dcmjs.sr.coding.CodedConcept({
            meaning: 'Length',
            value: '410668003',
            schemeDesignator: 'SCT',
          }),
        ]
        const measurementCodedConcept =
          getContentItemNameCodedConcept(measurement)
        if (
          SUPPORTED_MEASUREMENTS_CODED_CONCEPTS.some((codedConcept) =>
            areCodedConceptsEqual(measurementCodedConcept, codedConcept),
          )
        ) {
          feature.set(Enums.InternalProperties.Markup, Enums.Markup.Measurement)
          return true
        }
        return false
      })
    }

    if (evaluations?.length) {
      return evaluations.some((evaluation) => {
        // eslint-disable-line
        const SUPPORTED_EVALUATIONS_CODED_CONCEPTS = [
          new dcmjs.sr.coding.CodedConcept({
            value: '112039',
            meaning: 'Tracking Identifier',
            schemeDesignator: 'DCM',
          }),
        ]
        const evaluationCodedConcept =
          getContentItemNameCodedConcept(evaluation)
        if (
          SUPPORTED_EVALUATIONS_CODED_CONCEPTS.some((codedConcept) =>
            areCodedConceptsEqual(codedConcept, evaluationCodedConcept),
          )
        ) {
          feature.set(
            Enums.InternalProperties.Markup,
            Enums.Markup.TextEvaluation,
          )
          return true
        }
        return false
      })
    }
  }

  /**
   * Sets annotations visibility.
   *
   * @param {boolean} isVisible
   */
  setVisible(isVisible) {
    this.props.markupManager.setVisible(isVisible)
  }

  /**
   * Set markup visibility.
   *
   * @param {string} id The markup id
   * @param {boolean} isVisible The markup visibility
   */
  setMarkupVisibility(id, isVisible) {
    this.props.markupManager.setVisibility(id, isVisible)
  }

  onAdd(feature) {
    /**
     * Add properties to ROI feature before triggering
     * markup and markers callbacks to keep UI in sync.
     */
    this._addMeasurementsAndEvaluationsProperties(feature)

    this[Marker.Arrow].onAdd(feature)
    this[Markup.Measurement].onAdd(feature)
    this[Markup.TextEvaluation].onAdd(feature)
  }

  onFailure(uid) {
    this[Marker.Arrow].onFailure(uid)
    this[Markup.Measurement].onFailure(uid)
    this[Markup.TextEvaluation].onFailure(uid)
  }

  onRemove(feature) {
    this[Marker.Arrow].onRemove(feature)
    this[Markup.Measurement].onRemove(feature)
    this[Markup.TextEvaluation].onRemove(feature)
  }

  onUpdate(feature) {
    this[Marker.Arrow].onUpdate(feature)
    this[Markup.Measurement].onUpdate(feature)
    this[Markup.TextEvaluation].onUpdate(feature)
  }

  onDrawStart(event) {
    this[Marker.Arrow].onDrawStart(event)
    this[Markup.Measurement].onDrawStart(event)
    this[Markup.TextEvaluation].onDrawStart(event)
  }

  onDrawEnd(event) {
    this[Marker.Arrow].onDrawEnd(event)
    this[Markup.Measurement].onDrawEnd(event)
    this[Markup.TextEvaluation].onDrawEnd(event)
    this.props.markupManager.onDrawEnd(event)
  }

  onDrawAbort(event) {
    this[Marker.Arrow].onDrawAbort(event)
    this[Markup.Measurement].onDrawAbort(event)
    this[Markup.TextEvaluation].onDrawAbort(event)
    this.props.markupManager.onDrawAbort(event)
  }

  /**
   * Tear down markup overlays, link layer, and listeners.
   *
   * @returns {void}
   */
  destroy() {
    if (typeof this.props.markupManager.destroy === 'function') {
      this.props.markupManager.destroy()
    }
  }
}

export default _AnnotationManager
