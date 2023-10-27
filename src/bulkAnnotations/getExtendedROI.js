import dcmjs from 'dcmjs'

const getExtendedROI = ({ feature, roi, metadata }) => {
  const annotationGroupUID = feature.get('annotationGroupUID')
  const annotationGroupMetadata = metadata.AnnotationGroupSequence.find(
    (item) => item.AnnotationGroupUID === annotationGroupUID
  )

  if (annotationGroupUID == null || annotationGroupMetadata == null) {
    throw new Error(
      'Could not obtain information of annotation from ' +
        `annotation group "${annotationGroupUID}".`
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
          schemeDesignator: 'SCT'
        }),
        value: new dcmjs.sr.coding.CodedConcept({
          value: findingCategory.CodeValue,
          meaning: findingCategory.CodeMeaning,
          schemeDesignator: findingCategory.CodingSchemeDesignator
        }),
        relationshipType: dcmjs.sr.valueTypes.RelationshipTypes.HAS_CONCEPT_MOD
      })
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
          schemeDesignator: 'DCM'
        }),
        value: new dcmjs.sr.coding.CodedConcept({
          value: findingType.CodeValue,
          meaning: findingType.CodeMeaning,
          schemeDesignator: findingType.CodingSchemeDesignator
        }),
        relationshipType: dcmjs.sr.valueTypes.RelationshipTypes.HAS_CONCEPT_MOD
      })
    )
  }

  /**
   * Measurements for some or all annotations in the annotation group.
   * Each item describes one type of measurement.
   */
  if (annotationGroupMetadata.MeasurementsSequence != null) {
    annotationGroupMetadata.MeasurementsSequence.forEach(
      (measurementItem, measurementIndex) => {
        const key = `measurementValue${measurementIndex.toString()}`
        const value = feature.get(key)
        const name = measurementItem.ConceptNameCodeSequence[0]
        const unit = measurementItem.MeasurementUnitsCodeSequence[0]

        const measurement = new dcmjs.sr.valueTypes.NumContentItem({
          value: Number(value),
          name: new dcmjs.sr.coding.CodedConcept({
            value: name.CodeValue,
            meaning: name.CodeMeaning,
            schemeDesignator: name.CodingSchemeDesignator
          }),
          unit: new dcmjs.sr.coding.CodedConcept({
            value: unit.CodeValue,
            meaning: unit.CodeMeaning,
            schemeDesignator: unit.CodingSchemeDesignator
          }),
          relationshipType: dcmjs.sr.valueTypes.RelationshipTypes.CONTAINS
        })
        if (measurementItem.ReferencedImageSequence != null) {
          const ref = measurementItem.ReferencedImageSequence[0]
          const image = new dcmjs.sr.valueTypes.ImageContentItem({
            name: new dcmjs.sr.coding.CodedConcept({
              value: '121112',
              meaning: 'Source of Measurement',
              schemeDesignator: 'DCM'
            }),
            referencedSOPClassUID: ref.ReferencedSOPClassUID,
            referencedSOPInstanceUID: ref.ReferencedSOPInstanceUID
          })
          if (ref.ReferencedOpticalPathIdentifier != null) {
            image.ReferencedSOPSequence[0].ReferencedOpticalPathIdentifier =
              ref.ReferencedOpticalPathIdentifier
          }
          measurement.ContentSequence = [image]
        }
        roi.addMeasurement(measurement)
      }
    )
  }

  return roi
}

export default getExtendedROI
