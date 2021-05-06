import _AnnotationManager from './_AnnotationManager'
import _MarkupManager from './markups/_MarkupManager'
import MeasurementMarkup from './markups/measurement'
import TextEvaluationMarkup from './markups/textEvaluation'
import ArrowMarker from './markers/arrow'
import Enums from '../enums'
import * as utils from '../utils'

const { Marker, Markup, InternalProperties } = Enums

jest.mock('./markers/arrow', () =>
  jest.fn(() => ({
    onAdd: jest.fn(),
    onRemove: jest.fn(),
    onUpdate: jest.fn(),
    onDrawStart: jest.fn(),
    onDrawEnd: jest.fn()
  }))
)
jest.mock('./markups/measurement', () =>
  jest.fn(() => ({
    onAdd: jest.fn(),
    onRemove: jest.fn(),
    onUpdate: jest.fn(),
    onDrawStart: jest.fn(),
    onDrawEnd: jest.fn()
  }))
)
jest.mock('./markups/textEvaluation', () =>
  jest.fn(() => ({
    onAdd: jest.fn(),
    onRemove: jest.fn(),
    onUpdate: jest.fn(),
    onDrawStart: jest.fn(),
    onDrawEnd: jest.fn()
  }))
)
jest.mock('./markups/_MarkupManager', () =>
  jest.fn(() => ({ onDrawEnd: jest.fn() }))
)

describe('_AnnotationManager', () => {
  let _annotationManager,
    _markupManager,
    feature,
    featureProperties,
    event,
    map,
    measurements,
    evaluations,
    textContentItem,
    numContentItem

  beforeAll(() => {
    textContentItem = {
      ConceptNameCodeSequence: [
        {
          CodeMeaning: 'Tracking Identifier',
          CodeValue: '112039',
          CodingSchemeDesignator: 'DCM'
        }
      ]
    }
    numContentItem = {
      ConceptNameCodeSequence: [
        {
          CodeMeaning: 'Length',
          CodeValue: '410668003',
          CodingSchemeDesignator: 'SCT'
        }
      ]
    }
    event = { testing: 123 }
    measurements = [numContentItem]
    evaluations = [textContentItem]
    featureProperties = { measurements, evaluations }
    feature = {
      getProperties: jest.fn(() => featureProperties),
      set: jest.fn()
    }
    map = { addOverlay: jest.fn(), addLayer: jest.fn() }
    _markupManager = new _MarkupManager()
    _annotationManager = new _AnnotationManager({
      map: {}
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes properly', () => {
    _annotationManager = new _AnnotationManager({ map })
    expect(_annotationManager).toBeInstanceOf(_AnnotationManager)
  })

  it('it instantiates different annotation definitions with correct props', () => {
    _annotationManager = new _AnnotationManager({ map })
    expect(MeasurementMarkup).toHaveBeenCalledWith(_annotationManager.props)
    expect(TextEvaluationMarkup).toHaveBeenCalledWith(_annotationManager.props)
    expect(ArrowMarker).toHaveBeenCalledWith(_annotationManager.props)
  })

  it('it propagates the hook calls for all definitions', () => {
    _annotationManager = new _AnnotationManager({ map })

    _annotationManager.onAdd(feature)
    expect(_annotationManager[Markup.Measurement].onAdd).toHaveBeenCalledWith(
      feature
    )
    expect(
      _annotationManager[Markup.TextEvaluation].onAdd
    ).toHaveBeenCalledWith(feature)
    expect(_annotationManager[Marker.Arrow].onAdd).toHaveBeenCalledWith(
      feature
    )

    _annotationManager.onRemove(feature)
    expect(
      _annotationManager[Markup.Measurement].onRemove
    ).toHaveBeenCalledWith(feature)
    expect(
      _annotationManager[Markup.TextEvaluation].onRemove
    ).toHaveBeenCalledWith(feature)
    expect(_annotationManager[Marker.Arrow].onRemove).toHaveBeenCalledWith(
      feature
    )

    _annotationManager.onUpdate(feature)
    expect(
      _annotationManager[Markup.Measurement].onUpdate
    ).toHaveBeenCalledWith(feature)
    expect(
      _annotationManager[Markup.TextEvaluation].onUpdate
    ).toHaveBeenCalledWith(feature)
    expect(_annotationManager[Marker.Arrow].onUpdate).toHaveBeenCalledWith(
      feature
    )

    _annotationManager.onDrawStart(event)
    expect(
      _annotationManager[Markup.Measurement].onDrawStart
    ).toHaveBeenCalledWith(event)
    expect(
      _annotationManager[Markup.TextEvaluation].onDrawStart
    ).toHaveBeenCalledWith(event)
    expect(_annotationManager[Marker.Arrow].onDrawStart).toHaveBeenCalledWith(
      event
    )

    _annotationManager.onDrawEnd(event)
    expect(
      _annotationManager[Markup.Measurement].onDrawEnd
    ).toHaveBeenCalledWith(event)
    expect(
      _annotationManager[Markup.TextEvaluation].onDrawEnd
    ).toHaveBeenCalledWith(event)
    expect(_annotationManager[Marker.Arrow].onDrawEnd).toHaveBeenCalledWith(
      event
    )
  })

  it('update feature markup property based on feature measurements', () => {
    const getContentItemNameCodedConceptSpy = jest.spyOn(
      utils,
      'getContentItemNameCodedConcept'
    )
    featureProperties = { measurements }
    _annotationManager._addMeasurementsAndEvaluationsProperties(feature)
    expect(feature.getProperties).toHaveBeenCalled()
    expect(getContentItemNameCodedConceptSpy).toHaveBeenCalledWith(
      measurements[0]
    )
    expect(feature.set).toHaveBeenCalledWith(
      InternalProperties.Markup,
      Markup.Measurement
    )
  })

  it('update feature markup property based on feature text evaluations', () => {
    const getContentItemNameCodedConceptSpy = jest.spyOn(
      utils,
      'getContentItemNameCodedConcept'
    )
    featureProperties = { evaluations }
    _annotationManager._addMeasurementsAndEvaluationsProperties(feature)
    expect(feature.getProperties).toHaveBeenCalled()
    expect(getContentItemNameCodedConceptSpy).toHaveBeenCalledWith(
      evaluations[0]
    )
    expect(feature.set).toHaveBeenCalledWith(
      InternalProperties.Markup,
      Markup.TextEvaluation
    )
  })

  it('wont update feature markup property if invalid coded concept', () => {
    const getContentItemNameCodedConceptSpy = jest.spyOn(
      utils,
      'getContentItemNameCodedConcept'
    )
    evaluations[0].ConceptNameCodeSequence[0].CodeValue = 'False'
    featureProperties = { evaluations }
    _annotationManager._addMeasurementsAndEvaluationsProperties(feature)
    expect(feature.getProperties).toHaveBeenCalled()
    expect(getContentItemNameCodedConceptSpy).toHaveBeenCalledWith(
      evaluations[0]
    )
    expect(feature.set).not.toHaveBeenCalledWith(
      InternalProperties.Markup,
      Markup.TextEvaluation
    )
  })
})
