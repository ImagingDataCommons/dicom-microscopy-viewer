import dcmjs from 'dcmjs'
import { _fetchBulkdata, throttle } from './utils.js'

const _attrs = Symbol('attrs')

/**
 * Annotation Group.
 *
 * Describes an item of the Annotation Group Sequence of a DICOM Microscopy Bulk
 * Simple Annotations instance.
 *
 * @class
 * @memberof annotation
 */
class AnnotationGroup {
  /**
   * @param {Object} options - Options
   * @param {string} options.uid - Annotation Group UID
   * @param {number} options.number - Annotation Group Number (one-based index value)
   * @param {string} options.label - Annotation Group Label
   * @param {string} options.algorithmName - Annotation Group Algorithm Name
   * @param {Object} options.algorithmType - Annotation Group Algorithm Type
   * @param {Object} options.propertyCategory - Annotation Property Category Code
   * @param {Object} options.propertyType - Annotation Property Type Code
   * @param {string} options.studyInstanceUID - Study Instance UID of Annotation instances
   * @param {string} options.seriesInstanceUID - Series Instance UID of Annotation instances
   * @param {string[]} options.sopInstanceUIDs - SOP Instance UIDs of Annotation instances
   */
  constructor ({
    uid,
    number,
    label,
    propertyCategory,
    propertyType,
    algorithmType,
    algorithmName,
    studyInstanceUID,
    seriesInstanceUID,
    sopInstanceUIDs,
    referencedSeriesInstanceUID
  }) {
    this[_attrs] = {}
    if (uid == null) {
      throw new Error('Annotation Group UID is required.')
    } else {
      this[_attrs].uid = uid
    }

    if (number == null) {
      throw new Error('Annotation Group Number is required.')
    }
    this[_attrs].number = number

    if (label == null) {
      throw new Error('Annotation Group Label is required.')
    }
    this[_attrs].label = label

    if (propertyCategory == null) {
      throw new Error('Annotation Property Category is required.')
    }
    this[_attrs].propertyCategory = propertyCategory

    if (propertyType == null) {
      throw new Error('Annotation Property Type is required.')
    }
    this[_attrs].propertyType = propertyType

    this[_attrs].algorithmType = algorithmType
    this[_attrs].algorithmName = algorithmName

    if (studyInstanceUID == null) {
      throw new Error('Study Instance UID is required.')
    }
    this[_attrs].studyInstanceUID = studyInstanceUID

    if (seriesInstanceUID == null) {
      throw new Error('Series Instance UID is required.')
    }
    this[_attrs].seriesInstanceUID = seriesInstanceUID

    if (sopInstanceUIDs == null) {
      throw new Error('SOP Instance UIDs are required.')
    }
    this[_attrs].sopInstanceUIDs = sopInstanceUIDs
    this[_attrs].referencedSeriesInstanceUID = referencedSeriesInstanceUID
    Object.freeze(this)
  }

  /**
   * Annotation Group UID
   *
   * @type string
   */
  get uid () {
    return this[_attrs].uid
  }

  /**
   * Annotation Group Number.
   *
   * @type number
   */
  get number () {
    return this[_attrs].number
  }

  /**
   * Annotation Group Label
   *
   * @type string
   */
  get label () {
    return this[_attrs].label
  }

  /**
   * Annotation Group Algorithm Identification
   *
   * @type string
   */
  get algorithmName () {
    return this[_attrs].algorithmName
  }

  /**
   * Annotation Group Generation Type
   *
   * @type Object
   */
  get algorithmType () {
    return this[_attrs].algorithmType
  }

  /**
   * Annotation Property Category
   *
   * @type Object
   */
  get propertyCategory () {
    return this[_attrs].propertyCategory
  }

  /**
   * Annotation Property Type
   *
   * @type Object
   */
  get propertyType () {
    return this[_attrs].propertyType
  }

  /**
   * Study Instance UID of DICOM Microscopy Bulk Simple Annotations objects.
   *
   * @type string
   */
  get studyInstanceUID () {
    return this[_attrs].studyInstanceUID
  }

  /**
   * Series Instance UID of DICOM Microscopy Bulk Simple Annotations objects.
   *
   * @type string
   */
  get seriesInstanceUID () {
    return this[_attrs].seriesInstanceUID
  }

  /**
   * SOP Instance UIDs of DICOM Microscopy Bulk Simple Annotations objects.
   *
   * @type string[]
   */
  get sopInstanceUIDs () {
    return this[_attrs].sopInstanceUIDs
  }

  get referencedSeriesInstanceUID () {
    return this[_attrs].referencedSeriesInstanceUID
  }
}

/**
 * Fetch graphic data (point coordinates) of an annotation group.
 *
 * @param {Object} options
 * @param {Object} options.metadataItem - Metadata of Annotation Group Sequence item
 * @param {Object} options.bulkdataItem - Bulkdata of Annotation Group Sequence item
 * @param {Object} options.client - DICOMweb client
 *
 * @returns {Promise<TypedArray>} Graphic data
 *
 * @private
 */
async function _fetchGraphicData ({
  metadataItem,
  bulkdataItem,
  annotationGroupIndex,
  metadata,
  client
}) {
  const uid = metadataItem.AnnotationGroupUID
  if ('PointCoordinatesData' in metadataItem) {
    return metadataItem.PointCoordinatesData
  } else if ('DoublePointCoordinatesData' in metadataItem) {
    return metadataItem.DoublePointCoordinatesData
  } else {
    if (bulkdataItem == null) {
      /** Attempt to retrieve it from P10 */
      console.warn('Could not find "PointCoordinatesData" or "DoublePointCoordinatesData" in bulkdata or metadata, attempting to retrieve from P10.')
      const dicomP10 = await client.retrieveInstance({
        studyInstanceUID: metadata.StudyInstanceUID,
        seriesInstanceUID: metadata.SeriesInstanceUID,
        sopInstanceUID: metadata.SOPInstanceUID
      })
      const dicomDict = dcmjs.data.DicomMessage.readFile(dicomP10)
      const instance = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDict.dict)
      console.debug('p10 instance:', instance)
      const annotationGroupSequence = instance['006A0002'] || instance.AnnotationGroupSequence
      if (annotationGroupSequence) {
        const item = annotationGroupSequence[annotationGroupIndex]
        const pointCoordinatesData = item.PointCoordinatesData || item['00660016']
        const doublePointCoordinatesData = item.DoublePointCoordinatesData || item['00660016']
        if (item && pointCoordinatesData) {
          console.debug('PointCoordinatesData from p10:', pointCoordinatesData)
          return new Int32Array(pointCoordinatesData[0])
        } else if (item && doublePointCoordinatesData) {
          console.debug('DoublePointCoordinatesData from p10:', doublePointCoordinatesData)
          return new Float32Array(doublePointCoordinatesData[0])
        }
      }
      throw new Error(
        `Could not find bulkdata of annotation group "${uid}".`
      )
    } else {
      const progressCallback = (progressEvent) => {
        console.info(`Loaded ${Math.round(progressEvent.loaded / 1024 / 1024 * 100) / 100} MB from annotation group "${uid}"`)
      }
      const options = {
        progressCallback: throttle(progressCallback, 1000)
      }
      if ('PointCoordinatesData' in bulkdataItem) {
        console.info(`fetch point coordinate data of annotation group "${uid}"`)
        return await _fetchBulkdata({
          client,
          reference: bulkdataItem.PointCoordinatesData,
          options
        })
      } else if ('DoublePointCoordinatesData' in bulkdataItem) {
        console.info(`fetch point coordinate data of annotation group "${uid}"`)
        return await _fetchBulkdata({
          client,
          reference: bulkdataItem.DoublePointCoordinatesData,
          options
        })
      } else {
        /** Attempt to retrieve it from P10 */
        console.warn('Could not find "PointCoordinatesData" or "DoublePointCoordinatesData" in bulkdata or metadata, attempting to retrieve from P10.')
        const dicomP10 = await client.retrieveInstance({
          studyInstanceUID: metadata.StudyInstanceUID,
          seriesInstanceUID: metadata.SeriesInstanceUID,
          sopInstanceUID: metadata.SOPInstanceUID
        })
        const dicomDict = dcmjs.data.DicomMessage.readFile(dicomP10)
        const instance = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDict.dict)
        console.debug('p10 instance:', instance)
        const annotationGroupSequence = instance['006A0002'] || instance.AnnotationGroupSequence
        if (annotationGroupSequence) {
          const item = annotationGroupSequence[annotationGroupIndex]
          const pointCoordinatesData = item.PointCoordinatesData || item['00660016']
          const doublePointCoordinatesData = item.DoublePointCoordinatesData || item['00660016']
          if (item && pointCoordinatesData) {
            console.debug('PointCoordinatesData from p10:', pointCoordinatesData)
            return new Int32Array(pointCoordinatesData[0])
          } else if (item && doublePointCoordinatesData) {
            console.debug('DoublePointCoordinatesData from p10:', doublePointCoordinatesData)
            return new Float32Array(doublePointCoordinatesData[0])
          }
        }
        throw new Error(
          'Could not find "PointCoordinatesData" or ' +
          '"DoublePointCoordinatesData" in bulkdata ' +
          `of annotation group "${uid}".`
        )
      }
    }
  }
}

/**
 * Fetch graphic index (long primitive point index) of an annotation group.
 *
 * @param {object} options
 * @param {object} options.metadataItem - Metadata of Annotation Group Sequence item
 * @param {object} options.bulkdataItem - Bulkdata of Annotation Group Sequence item
 * @param {object} options.client - DICOMweb client
 *
 * @returns {Promise<TypedArray|null>} Graphic index
 *
 * @private
 */
async function _fetchGraphicIndex ({
  metadataItem,
  bulkdataItem,
  metadata,
  annotationGroupIndex,
  client
}) {
  const uid = metadataItem.AnnotationGroupUID
  const graphicType = metadataItem.GraphicType
  if ('LongPrimitivePointIndexList' in metadataItem) {
    return metadataItem.LongPrimitivePointIndexList
  } else {
    if (bulkdataItem == null) {
      if (graphicType === 'POLYGON') {
        throw new Error(
          `Could not find bulkdata of annotation group "${uid}".`
        )
      } else {
        return null
      }
    } else {
      if ('LongPrimitivePointIndexList' in bulkdataItem) {
        console.info(`fetch point index list of annotation group "${uid}"`)
        return await _fetchBulkdata({
          client,
          reference: bulkdataItem.LongPrimitivePointIndexList
        })
      } else {
        if (graphicType === 'POLYGON') {
          /** Attempt to retrieve it from P10 */
          console.warn('Could not find "LongPrimitivePointIndexList" in bulkdata or metadata, attempting to retrieve from P10.')
          const dicomP10 = await client.retrieveInstance({
            studyInstanceUID: metadata.StudyInstanceUID,
            seriesInstanceUID: metadata.SeriesInstanceUID,
            sopInstanceUID: metadata.SOPInstanceUID
          })
          const dicomDict = dcmjs.data.DicomMessage.readFile(dicomP10)
          const instance = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDict.dict)
          console.debug('p10 instance:', instance)
          const annotationGroupSequence = instance['006A0002'] || instance.AnnotationGroupSequence
          if (annotationGroupSequence) {
            const item = annotationGroupSequence[annotationGroupIndex]
            const longPrimitivePointIndexList = item.LongPrimitivePointIndexList || item['00660040']
            if (item && longPrimitivePointIndexList) {
              console.debug('LongPrimitivePointIndexList from p10', longPrimitivePointIndexList)
              return new Int32Array(longPrimitivePointIndexList[0])
            }
          }
          throw new Error(
            'Could not find "LongPrimitivePointIndexList" ' +
            `in bulkdata of annotation group "${uid}".`
          )
        } else {
          return null
        }
      }
    }
  }
}

/**
 * Fetch measurement values of an annotation group.
 *
 * @param {object} options
 * @param {object} options.metadataItem - Metadata of Annotation Group Sequence item
 * @param {object} options.bulkdataItem - Bulkdata of Annotation Group Sequence item
 * @param {number} options.index - Zero-based index in the Measurements Sequence
 * @param {object} options.client - DICOMweb client
 *
 * @returns {Promise<TypeArray>} Values
 *
 * @private
 */
async function _fetchMeasurementValues ({
  metadataItem,
  bulkdataItem,
  index,
  client
}) {
  const uid = metadataItem.AnnotationGroupUID
  const measurementMetadataItem = metadataItem.MeasurementsSequence[index]
  const valuesMetadataItem = measurementMetadataItem.MeasurementValuesSequence[0]
  if ('FloatingPointValues' in valuesMetadataItem) {
    return valuesMetadataItem.FloatingPointValues
  } else {
    if (bulkdataItem == null) {
      throw new Error(
        `Could not find bulkdata of annotation group "${uid}".`
      )
    } else if (bulkdataItem.MeasurementsSequence == null) {
      console.warn(
        `Could not find item #${index + 1} of "MeasurementSequence" ` +
        `in bulkdata of annotation group "${uid}".`
      )
      return []
      // throw new Error(
      //   `Could not find item #${index + 1} of "MeasurementSequence" ` +
      //   `in bulkdata of annotation group "${uid}".`
      // )
    } else {
      const measurementBulkdataItem = bulkdataItem.MeasurementsSequence[index]
      const valuesBulkdataItem = (
        measurementBulkdataItem.MeasurementValuesSequence[0]
      )
      if ('FloatingPointValues' in valuesBulkdataItem) {
        const nameItem = measurementMetadataItem.ConceptNameCodeSequence[0]
        const name = nameItem.CodeMeaning
        console.info(
          `fetch measurement values for measurement #${index} "${name}"`
        )
        return await _fetchBulkdata({
          client,
          reference: valuesBulkdataItem.FloatingPointValues
        })
      } else {
        throw new Error(
          `Could not find "FloatingPointValues" in item #${index + 1} ` +
          'of "MeasurementSequence" in bulkdata ' +
          `of annotation group "${uid}".`
        )
      }
    }
  }
}

/**
 * Fetch measurement annotation indices of an annotation group.
 *
 * @param {object} options
 * @param {object} options.metadataItem - Metadata of Annotation Group Sequence item
 * @param {object} options.bulkdataItem - Bulkdata of Annotation Group Sequence item
 * @param {number} options.index - Zero-based index in the Measurements Sequence
 * @param {object} options.client - DICOMweb client
 *
 * @returns {Promise<TypeArray|null>} Annotation indices
 *
 * @private
 */
async function _fetchMeasurementIndices ({
  metadataItem,
  bulkdataItem,
  index,
  client
}) {
  const uid = metadataItem.AnnotationGroupUID
  const measurementMetadataItem = metadataItem.MeasurementsSequence[index]
  const valuesMetadataItem = measurementMetadataItem.MeasurementValuesSequence[0]
  if ('AnnotationIndexList' in valuesMetadataItem) {
    return valuesMetadataItem.AnnotationIndexList
  } else {
    if (bulkdataItem == null) {
      throw new Error(
        `Could not find bulkdata of annotation group "${uid}".`
      )
    } else if (bulkdataItem.MeasurementsSequence == null) {
      console.warn(
        `Could not find item #${index + 1} of "MeasurementSequence" ` +
        `in bulkdata of annotation group "${uid}".`
      )
      return []
      // throw new Error(
      //   `Could not find item #${index + 1} of "MeasurementSequence" ` +
      //   `in bulkdata of annotation group "${uid}".`
      // )
    } else {
      const measurementBulkdataItem = bulkdataItem.MeasurementsSequence[index]
      const valuesBulkdataItem = (
        measurementBulkdataItem
          .MeasurementValuesSequence[0]
      )
      if ('AnnotationIndexList' in valuesBulkdataItem) {
        const nameItem = measurementMetadataItem.ConceptNameCodeSequence[0]
        const name = nameItem.CodeMeaning
        console.info(
          `fetch measurement indices for measurement #${index} "${name}"`
        )
        return await _fetchBulkdata({
          client,
          reference: valuesBulkdataItem.AnnotationIndexList
        })
      } else {
        return null
      }
    }
  }
}

/**
 * Fetch all measurements of an annotation group.
 *
 * @param {object} options
 * @param {object} options.metadataItem - Metadata of Annotation Group Sequence item
 * @param {object} options.bulkdataItem - Bulkdata of Annotation Group Sequence item
 * @param {object} options.client - DICOMweb client
 *
 * @returns {Promise<Array<object>>} Name, values, and indices of measurements
 *
 * @private
 */
async function _fetchMeasurements ({
  metadataItem,
  bulkdataItem,
  metadata,
  annotationGroupIndex,
  client
}) {
  const measurements = []
  if (metadataItem.MeasurementsSequence !== undefined) {
    for (let i = 0; i < metadataItem.MeasurementsSequence.length; i++) {
      const item = metadataItem.MeasurementsSequence[i]
      const name = item.ConceptNameCodeSequence[0]
      const unit = item.MeasurementUnitsCodeSequence[0]
      const values = await _fetchMeasurementValues({
        metadataItem,
        bulkdataItem,
        index: i,
        client
      })
      const indices = await _fetchMeasurementIndices({
        metadataItem,
        bulkdataItem,
        index: i,
        client
      })
      measurements.push({
        name,
        unit,
        values,
        indices
      })
    }
  }
  return measurements
}

/**
 * Fetch an individual measurement of an annotation group.
 *
 * @param {object} options
 * @param {object} options.metadataItem - Metadata of Annotation Group Sequence item
 * @param {object} options.bulkdataItem - Bulkdata of Annotation Group Sequence item
 * @param {object} options.index - Index of the Measurements Sequence item
 * @param {object} options.client - DICOMweb client
 *
 * @returns {Promise<Array<object>>} Name, values, and indices of measurements
 *
 * @private
 */
async function _fetchMeasurement ({
  metadataItem,
  bulkdataItem,
  metadata,
  annotationGroupIndex,
  index,
  client
}) {
  if (metadataItem.MeasurementsSequence == null) {
    throw new Error(
      'Measurements Sequence element is not contained in metadata.'
    )
  }
  if (metadataItem.MeasurementsSequence.length === 0) {
    throw new Error(
      'Measurements Sequence element in empty.'
    )
  }
  const item = metadataItem.MeasurementsSequence[index]
  if (item == null) {
    throw new Error(
      `Measurements Sequence does not contain an item #${index}.`
    )
  }
  const name = item.ConceptNameCodeSequence[0]
  const unit = item.MeasurementUnitsCodeSequence[0]
  const values = await _fetchMeasurementValues({
    metadataItem,
    bulkdataItem,
    metadata,
    annotationGroupIndex,
    index,
    client
  })
  const indices = await _fetchMeasurementIndices({
    metadataItem,
    bulkdataItem,
    metadata,
    annotationGroupIndex,
    index,
    client
  })
  return { name, unit, values, indices }
}

/**
 * Get dimensionality of coordinates.
 *
 * @param {object} metadataItem - Metadata of Annotation Group Sequence item
 * @param {string} annotationCoordinateType - Annotation Coordinate Type
 *
 * @returns {number} Dimensionality (2 or 3)
 *
 * @private
 */
function _getCoordinateDimensionality (metadataItem, annotationCoordinateType) {
  /** TODO: Check this logic against the standard */
  if (metadataItem.CommonZCoordinateValue == null) {
    if (annotationCoordinateType === '2D') {
      return 2
    }
    return 3
  }
  return 2
}
/**
 * Get common Z coordinate value that is shared across all annotations.
 *
 * @param {object} metadataItem - Metadata of Annotation Group Sequence item
 *
 * @returns {number} Value (NaN in case there is no common Z coordinate)
 *
 * @private
 */
function _getCommonZCoordinate (metadataItem) {
  if (metadataItem.CommonZCoordinateValue == null) {
    return Number.NaN
  }
  return Number(metadataItem.CommonZCoordinateValue)
}

/**
 * Get coordinates of an annotation.
 *
 * @param {TypedArray} graphicData - Points coordinates of all annotations
 * @param {number} offset - Offset for the annotation of interest.
 * @param {number} commonZCoordinate - Z coordinate that is shared across annotations.
 *
 * @returns {Array<number>} (x, y, z) or (column, row, slice) coordinates
 *
 * @private
 */
function _getCoordinates (graphicData, offset, commonZCoordinate) {
  const point = [
    graphicData[offset],
    graphicData[offset + 1]
  ]
  if (isNaN(commonZCoordinate)) {
    point.push(graphicData[offset + 2])
  } else {
    point.push(commonZCoordinate)
  }
  return point
}

/**
 * Get coordinates of a POINT annotation.
 *
 * @param {TypedArray} graphicData - Point coordinates of all annotations
 * @param {TypedArray} graphicIndex - Annotation index of all annotations
 * @param {number} coordinateDimensionality - Dimensionality of stored coordinates.
 * @param {number} commonZCoordinate - Z coordinate that is shared across annotations.
 * @param {number} annotationIndex - Index of the annotation of interest.
 * @param {number} numberOfAnnotations - Total number of annotations.
 *
 * @returns {Array<number>} (x, y, z) or (column, row, slice) coordinates
 *
 * @private
 */
function _getPoint (
  graphicData,
  graphicIndex,
  coordinateDimensionality,
  commonZCoordinate,
  annotationIndex,
  numberOfAnnotations
) {
  const length = coordinateDimensionality
  const offset = annotationIndex * length
  return _getCoordinates(graphicData, offset, commonZCoordinate)
}

/**
 * Get coordinates of the centroid point of a RECTANGLE annotation.
 *
 * @param {TypedArray} graphicData - Point coordinates of all annotations
 * @param {TypedArray} graphicIndex - Annotation index of all annotations
 * @param {number} coordinateDimensionality - Dimensionality of stored coordinates.
 * @param {number} commonZCoordinate - Z coordinate that is shared across annotations.
 * @param {number} annotationIndex - Index of the annotation of interest.
 * @param {number} numberOfAnnotations - Total number of annotations.
 *
 * @returns {Array<number>} (x, y, z) or (column, row, slice) coordinates
 *
 * @private
 */
function _getRectangleCentroid (
  graphicData,
  graphicIndex,
  coordinateDimensionality,
  commonZCoordinate,
  annotationIndex,
  numberOfAnnotations
) {
  const length = coordinateDimensionality * 4
  const offset = annotationIndex * length
  const coordinates = []
  for (let j = offset; j < offset + length; j++) {
    const p = _getCoordinates(graphicData, j, commonZCoordinate)
    coordinates.push(p)
    j += coordinateDimensionality - 1
  }
  const topLeft = coordinates[0]
  const topRight = coordinates[1]
  const bottomLeft = coordinates[3]
  return [
    topLeft[0] + (topRight[0] - topLeft[0]) / 2,
    topLeft[1] + (topLeft[1] - bottomLeft[1]) / 2,
    0
  ]
}

/**
 * Get coordinates of the centroid point of an ELLIPSE annotation.
 *
 * @param {TypedArray} graphicData - Point coordinates of all annotations
 * @param {TypedArray} graphicIndex - Annotation index of all annotations
 * @param {number} coordinateDimensionality - Dimensionality of stored coordinates.
 * @param {number} commonZCoordinate - Z coordinate that is shared across annotations.
 * @param {number} annotationIndex - Index of the annotation of interest.
 * @param {number} numberOfAnnotations - Total number of annotations.
 *
 * @returns {Array<number>} (x, y, z) or (column, row, slice) coordinates
 *
 * @private
 */
function _getEllipseCentroid (
  graphicData,
  graphicIndex,
  coordinateDimensionality,
  commonZCoordinate,
  annotationIndex,
  numberOfAnnotations
) {
  const length = coordinateDimensionality * 4
  const offset = annotationIndex * length
  const coordinates = []
  for (let j = offset; j < offset + length; j++) {
    const p = _getCoordinates(graphicData, j, commonZCoordinate)
    coordinates.push(p)
    j += coordinateDimensionality - 1
  }
  const majorAxisFirstEndpoint = coordinates[0]
  const majorAxisSecondEndpoint = coordinates[1]
  return [
    (majorAxisSecondEndpoint[0] - majorAxisFirstEndpoint[0]) / 2,
    (majorAxisSecondEndpoint[1] - majorAxisFirstEndpoint[1]) / 2,
    0
  ]
}

/**
 * Get coordinates of the centroid point of a POLYGON annotation.
 *
 * @param {TypedArray} graphicData - Point coordinates of all annotations
 * @param {TypedArray} graphicIndex - Annotation index of all annotations
 * @param {number} coordinateDimensionality - Dimensionality of stored coordinates.
 * @param {number} commonZCoordinate - Z coordinate that is shared across annotations.
 * @param {number} annotationIndex - Index of the annotation of interest.
 * @param {number} numberOfAnnotations - Total number of annotations.
 *
 * @returns {Array<number>} (x, y, z) or (column, row, slice) coordinates
 *
 * @private
 */
function _getPolygonCentroid (
  graphicData,
  graphicIndex,
  coordinateDimensionality,
  commonZCoordinate,
  annotationIndex,
  numberOfAnnotations
) {
  const offset = graphicIndex[annotationIndex] - 1
  let length
  if (annotationIndex < (numberOfAnnotations - 1)) {
    length = graphicIndex[annotationIndex + 1] - offset
  } else {
    length = graphicData.length
  }
  // https://en.wikipedia.org/wiki/Centroid#Of_a_polygon
  const point = [0, 0, 0]
  let area = 0
  for (let j = offset; j < offset + length; j++) {
    const p0 = _getCoordinates(graphicData, j, commonZCoordinate)
    let p1
    if (j === (offset + length - 1)) {
      p1 = _getCoordinates(graphicData, offset, commonZCoordinate)
    } else {
      const nextOffset = j + coordinateDimensionality
      p1 = _getCoordinates(graphicData, nextOffset, commonZCoordinate)
    }
    const a = p0[0] * p1[1] - p1[0] * p0[1]
    area += a
    point[0] += (p0[0] + p1[0]) * a
    point[1] += (p0[1] + p1[1]) * a
    j += coordinateDimensionality - 1
  }
  area *= 0.5
  point[0] /= 6 * area
  point[1] /= 6 * area
  return point
}

/**
 * Get coordinates of the centroid point of an annotation.
 *
 * @param {string} graphicType - Type of annotations (POINT, POLYGON, etc.)
 * @param {TypedArray} graphicData - Point coordinates of all annotations
 * @param {TypedArray} graphicIndex - Annotation index of all annotations
 * @param {number} coordinateDimensionality - Dimensionality of stored coordinates.
 * @param {number} commonZCoordinate - Z coordinate that is shared across annotations.
 * @param {number} annotationIndex - Index of the annotation of interest.
 * @param {number} numberOfAnnotations - Total number of annotations.
 *
 * @returns {Array<number>} (x, y, z) or (column, row, slice) coordinates
 *
 * @private
 */
const _getCentroid = (
  graphicType,
  graphicData,
  graphicIndex,
  coordinateDimensionality,
  commonZCoordinate,
  annotationIndex,
  numberOfAnnotations
) => {
  if (graphicType === 'POINT') {
    return _getPoint(
      graphicData,
      graphicIndex,
      coordinateDimensionality,
      commonZCoordinate,
      annotationIndex,
      numberOfAnnotations
    )
  } else if (graphicType === 'RECTANGLE') {
    return _getRectangleCentroid(
      graphicData,
      graphicIndex,
      coordinateDimensionality,
      commonZCoordinate,
      annotationIndex,
      numberOfAnnotations
    )
  } else if (graphicType === 'ELLIPSE') {
    return _getEllipseCentroid(
      graphicData,
      graphicIndex,
      coordinateDimensionality,
      commonZCoordinate,
      annotationIndex,
      numberOfAnnotations
    )
  } else if (graphicType === 'POLYGON') {
    return _getPolygonCentroid(
      graphicData,
      graphicIndex,
      coordinateDimensionality,
      commonZCoordinate,
      annotationIndex,
      numberOfAnnotations
    )
  } else {
    throw new Error(
      `Encountered unexpected graphic type "${graphicType}".`
    )
  }
}

export {
  AnnotationGroup,
  _fetchGraphicData,
  _fetchGraphicIndex,
  _fetchMeasurements,
  _fetchMeasurement,
  _getCentroid,
  _getCommonZCoordinate,
  _getCoordinateDimensionality,
  _getPoint,
  _getCoordinates
}
