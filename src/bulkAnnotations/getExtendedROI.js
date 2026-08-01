import dcmjs from 'dcmjs'

/**
 * Extend an ROI with annotation-group metadata (property category/type +
 * measurements). Accepts either a legacy OpenLayers Feature or a plain
 * `{ annotationGroupUID, annotationIndex, measurementValues }` descriptor.
 *
 * @param {Object} options
 * @param {Object} [options.feature] - Legacy OL Feature (optional)
 * @param {string} [options.annotationGroupUID]
 * @param {number} [options.annotationIndex]
 * @param {number[]} [options.measurementValues]
 * @param {Object} options.roi - roi.ROI instance
 * @param {Object} options.metadata - MicroscopyBulkSimpleAnnotations metadata
 * @param {Object} [options.annotationGroup] - Annotation group sequence item
 * @returns {Object} The extended ROI
 */
const getExtendedROI = ({
  feature,
  annotationGroupUID: uidArg,
  annotationIndex,
  measurementValues,
  roi,
  metadata,
  annotationGroup,
}) => {
  const annotationGroupUID =
    uidArg ??
    (feature != null && typeof feature.get === 'function'
      ? feature.get('annotationGroupUID')
      : undefined)

  const annotationGroupMetadata =
    metadata?.AnnotationGroupSequence?.find(
      (item) => item.AnnotationGroupUID === annotationGroupUID,
    ) ||
    (annotationGroup?.AnnotationGroupUID != null ? annotationGroup : null) ||
    annotationGroup

  if (annotationGroupUID == null || annotationGroupMetadata == null) {
    throw new Error(
      'Could not obtain information of annotation from ' +
        `annotation group "${annotationGroupUID}".`,
    )
  }

  if (annotationGroupMetadata.AnnotationPropertyCategoryCodeSequence != null) {
    const findingCategory =
      annotationGroupMetadata.AnnotationPropertyCategoryCodeSequence[0]
    roi.addEvaluation(
      new dcmjs.sr.valueTypes.CodeContentItem({
        name: new dcmjs.sr.coding.CodedConcept({
          value: '276214006',
          meaning: 'Finding category',
          schemeDesignator: 'SCT',
        }),
        value: new dcmjs.sr.coding.CodedConcept({
          value: findingCategory.CodeValue,
          meaning: findingCategory.CodeMeaning,
          schemeDesignator: findingCategory.CodingSchemeDesignator,
        }),
        relationshipType: dcmjs.sr.valueTypes.RelationshipTypes.HAS_CONCEPT_MOD,
      }),
    )
  }

  if (annotationGroupMetadata.AnnotationPropertyTypeCodeSequence != null) {
    const findingType =
      annotationGroupMetadata.AnnotationPropertyTypeCodeSequence[0]
    roi.addEvaluation(
      new dcmjs.sr.valueTypes.CodeContentItem({
        name: new dcmjs.sr.coding.CodedConcept({
          value: '121071',
          meaning: 'Finding',
          schemeDesignator: 'DCM',
        }),
        value: new dcmjs.sr.coding.CodedConcept({
          value: findingType.CodeValue,
          meaning: findingType.CodeMeaning,
          schemeDesignator: findingType.CodingSchemeDesignator,
        }),
        relationshipType: dcmjs.sr.valueTypes.RelationshipTypes.HAS_CONCEPT_MOD,
      }),
    )
  }

  if (annotationGroupMetadata.MeasurementsSequence != null) {
    annotationGroupMetadata.MeasurementsSequence.forEach(
      (measurementItem, measurementIndex) => {
        let value
        if (measurementValues != null) {
          value = measurementValues[measurementIndex]
        } else if (feature != null && typeof feature.get === 'function') {
          const key = `measurementValue${measurementIndex.toString()}`
          value = feature.get(key)
        }
        const name = measurementItem.ConceptNameCodeSequence[0]
        const unit = measurementItem.MeasurementUnitsCodeSequence[0]

        const measurement = new dcmjs.sr.valueTypes.NumContentItem({
          value: Number(value),
          name: new dcmjs.sr.coding.CodedConcept({
            value: name.CodeValue,
            meaning: name.CodeMeaning,
            schemeDesignator: name.CodingSchemeDesignator,
          }),
          unit: new dcmjs.sr.coding.CodedConcept({
            value: unit.CodeValue,
            meaning: unit.CodeMeaning,
            schemeDesignator: unit.CodingSchemeDesignator,
          }),
          relationshipType: dcmjs.sr.valueTypes.RelationshipTypes.CONTAINS,
        })
        if (measurementItem.ReferencedImageSequence != null) {
          const ref = measurementItem.ReferencedImageSequence[0]
          const image = new dcmjs.sr.valueTypes.ImageContentItem({
            name: new dcmjs.sr.coding.CodedConcept({
              value: '121112',
              meaning: 'Source of Measurement',
              schemeDesignator: 'DCM',
            }),
            referencedSOPClassUID: ref.ReferencedSOPClassUID,
            referencedSOPInstanceUID: ref.ReferencedSOPInstanceUID,
          })
          if (ref.ReferencedOpticalPathIdentifier != null) {
            image.ReferencedSOPSequence[0].ReferencedOpticalPathIdentifier =
              ref.ReferencedOpticalPathIdentifier
          }
          measurement.ContentSequence = [image]
        }
        roi.addMeasurement(measurement)
      },
    )
  }

  /** Keep annotationIndex available for callers that need it. */
  if (annotationIndex != null && typeof roi === 'object') {
    try {
      Object.defineProperty(roi, '_bulkAnnotationIndex', {
        value: annotationIndex,
        enumerable: false,
      })
    } catch {
      /* ignore */
    }
  }

  return roi
}

export default getExtendedROI
