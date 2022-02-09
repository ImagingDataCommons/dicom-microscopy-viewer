import { getContentItemNameCodedConcept } from './utils.js'

const _attrs = Symbol('attrs')

/** An annotation group.
 *
 * @class
 * @memberof annotation
 */
class AnnotationGroup {
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
    sopInstanceUIDs
  }) {
    this[_attrs] = {}
    if (uid === undefined) {
      throw new Error('Annotation Group UID is required.')
    } else {
      this[_attrs].uid = uid
    }

    if (number === undefined) {
      throw new Error('Annotation Group Number is required.')
    }
    this[_attrs].number = number

    if (label === undefined) {
      throw new Error('Annotation Group Label is required.')
    }
    this[_attrs].label = label

    if (propertyCategory === undefined) {
      throw new Error('Annotation Property Category is required.')
    }
    this[_attrs].propertyCategory = propertyCategory

    if (propertyType === undefined) {
      throw new Error('Annotation Property Type is required.')
    }
    this[_attrs].propertyType = propertyType

    if (algorithmName === undefined) {
      throw new Error('Annotation Group Algorithm Name is required.')
    }
    this[_attrs].algorithmType = algorithmType

    if (algorithmType === undefined) {
      throw new Error('Annotation Group Generation Type is required.')
    }
    this[_attrs].algorithmName = algorithmName

    if (studyInstanceUID === undefined) {
      throw new Error('Study Instance UID is required.')
    }
    this[_attrs].studyInstanceUID = studyInstanceUID

    if (seriesInstanceUID === undefined) {
      throw new Error('Series Instance UID is required.')
    }
    this[_attrs].seriesInstanceUID = seriesInstanceUID

    if (sopInstanceUIDs === undefined) {
      throw new Error('SOP Instance UIDs are required.')
    }
    this[_attrs].sopInstanceUIDs = sopInstanceUIDs
  }

  /** Get Annotation Group UID
   *
   * @returns {string} Annotation Group UID
   */
  get uid () {
    return this[_attrs].uid
  }

  /** Get Annotation Group Number.
   *
   * @returns {number} Annotation Group Number
   */
  get number () {
    return this[_attrs].number
  }

  /** Get Annotation Group Label
   *
   * @returns {string} Annotation Group Label
   */
  get label () {
    return this[_attrs].label
  }

  /** Get Segment Algorithm Name
   *
   * @returns {string} Segment Algorithm Name
   */
  get algorithmName () {
    return this[_attrs].algorithmName
  }

  /** Get Annotation Group Generation Type
   *
   * @returns {string} Annotation Group Generation Type
   */
  get algorithmType () {
    return this[_attrs].algorithmType
  }

  /** Get Annotation Property Category
   *
   * @returns {object} Annotation Property Category
   */
  get propertyCategory () {
    return this[_attrs].propertyCategory
  }

  /** Get Annotation Property Type
   *
   * @returns {object} Annotation Property Type
   */
  get propertyType () {
    return this[_attrs].propertyType
  }

  /** Get Study Instance UID of Microscopy Bulk Simple Annotations objects.
   *
   * @returns {string} Study Instance UID
   */
  get studyInstanceUID () {
    return this[_attrs].studyInstanceUID
  }

  /** Get Series Instance UID of Microscopy Bulk Simple Annotations objects.
   *
   * @returns {string} Series Instance UID
   */
  get seriesInstanceUID () {
    return this[_attrs].seriesInstanceUID
  }

  /** Get SOP Instance UIDs of Microscopy Bulk Simple Annotations objects.
   *
   * @returns {string[]} SOP Instance UIDs
   */
  get sopInstanceUIDs () {
    return this[_attrs].sopInstanceUIDs
  }
}

const _fixBulkDataURI = (uri) => {
  // FIXME: Configure dcm4che-arc-light so that BulkDataURI value is
  // set correctly by the archive:
  // https://dcm4chee-arc-cs.readthedocs.io/en/latest/networking/config/archiveDevice.html#dcmremapretrieveurl
  return uri.replace(
    'arc:8080/dcm4chee-arc/aets/DCM4CHEE/rs/',
    'localhost:8008/dicomweb/'
  )
}

/**
 * Fetch graphic data (point coordinates) of an annotation group.
 *
 * @param {object} options
 * @param {object} options.metadataItem - Metadata of Annotation Group Sequence item
 * @param {object} options.bulkdataItem - Bulkdata of Annotation Group Sequence item
 * @param {object} options.client - DICOMweb client
 *
 * @returns {Promise<TypedArray>} Graphic data
 *
 * @private
 */
async function _fetchGraphicData ({
  metadataItem,
  bulkdataItem,
  client
}) {
  const uid = metadataItem.AnnotationGroupUID
  if ('PointCoordinatesData' in metadataItem) {
    return metadataItem.PointCoordinatesData
  } else if ('DoublePointCoordinatesData' in metadataItem) {
    return metadataItem.DoublePointCoordinatesData
  } else {
    if (bulkdataItem == null) {
      throw new Error(
        `Could not find bulkdata of annotation group "${uid}".`
      )
    } else {
      if ('PointCoordinatesData' in bulkdataItem) {
        const retrieveOptions = {
          BulkDataURI: _fixBulkDataURI(
            bulkdataItem.PointCoordinatesData.BulkDataURI
          )
        }
        return await client.retrieveBulkData(retrieveOptions).then(data => {
          const byteArray = new Uint8Array(data[0])
          return new Float32Array(
            byteArray.buffer,
            byteArray.byteOffset,
            byteArray.byteLength / 4
          )
        })
      } else if ('DoublePointCoordinatesData' in bulkdataItem) {
        const retrieveOptions = {
          BulkDataURI: _fixBulkDataURI(
            bulkdataItem.DoublePointCoordinatesData.BulkDataURI
          )
        }
        return await client.retrieveBulkData(retrieveOptions).then(data => {
          const byteArray = new Uint8Array(data[0])
          return new Float64Array(
            byteArray.buffer,
            byteArray.byteOffset,
            byteArray.byteLength / 8
          )
        })
      } else {
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
        const retrieveOptions = {
          BulkDataURI: _fixBulkDataURI(
            bulkdataItem.LongPrimitivePointIndexList.BulkDataURI
          )
        }
        return await client.retrieveBulkData(retrieveOptions).then(data => {
          const byteArray = new Uint8Array(data[0])
          return new Int32Array(
            byteArray.buffer,
            byteArray.byteOffset,
            byteArray.byteLength / 4
          )
        })
      } else {
        if (graphicType === 'POLYGON') {
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
    if (bulkdataItem.MeasurementsSequence == null) {
      throw new Error(
        `Could not find item #${index + 1} of "MeasurementSequence" ` +
        `in bulkdata of annotation group "${uid}".`
      )
    } else {
      const measurementBulkdataItem = bulkdataItem.MeasurementsSequence[index]
      const valuesBulkdataItem = (
        measurementBulkdataItem.MeasurementValuesSequence[0]
      )
      if ('FloatingPointValues' in valuesBulkdataItem) {
        const retrieveOptions = {
          BulkDataURI: _fixBulkDataURI(
            valuesBulkdataItem.FloatingPointValues.BulkDataURI
          )
        }
        return await client.retrieveBulkData(retrieveOptions).then(data => {
          const byteArray = new Uint8Array(data[0])
          return new Float32Array(
            byteArray.buffer,
            byteArray.byteOffset,
            byteArray.byteLength / 4
          )
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
    if (bulkdataItem.MeasurementsSequence == null) {
      throw new Error(
        `Could not find item #${index + 1} of "MeasurementSequence" ` +
        `in bulkdata of annotation group "${uid}".`
      )
    } else {
      const measurementBulkdataItem = bulkdataItem.MeasurementsSequence[index]
      const valuesBulkdataItem = (
        measurementBulkdataItem
          .MeasurementValuesSequence[0]
      )
      if ('AnnotationIndexList' in valuesBulkdataItem) {
        const retrieveOptions = {
          BulkDataURI: _fixBulkDataURI(
            valuesBulkdataItem.AnnotationIndexList.BulkDataURI
          )
        }
        return client.retrieveBulkData(retrieveOptions).then(data => {
          const byteArray = new Uint8Array(data[0])
          return new Int32Array(
            byteArray.buffer,
            byteArray.byteOffset,
            byteArray.byteLength / 4
          )
        })
      } else {
        return null
      }
    }
  }
}

/**
 * Fetch measurements of an annotation group.
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
  client
}) {
  const measurements = []
  if (metadataItem.MeasurementsSequence !== undefined) {
    for (let i = 0; i < metadataItem.MeasurementsSequence.length; i++) {
      const item = metadataItem.MeasurementsSequence[i]
      const name = getContentItemNameCodedConcept(item)
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
        values,
        indices
      })
    }
  }
  return measurements
}

/**
 * Get dimensionality of coordinates.
 *
 * @param {object} metadataItem - Metadata of Annotation Group Sequence item
 *
 * @returns {number} Dimensionality (2 or 3)
 *
 * @private
 */
function _getCoordinateDimensionality (metadataItem) {
  if (metadataItem.CommonZCoordinateValue == null) {
    if (metadataItem.AnnotationCoordinateType === '2D') {
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
    length = offset - graphicIndex[annotationIndex + 1]
  } else {
    length = graphicData.length
  }
  // https://en.wikipedia.org/wiki/Centroid#Of_a_polygon
  const point = [0, 0, 0]
  let area = 0
  for (let j = offset; j < offset + length; j++) {
    const p0 = _getCoordinates(graphicData, j, commonZCoordinate)
    let p1
    if (j === (offset + length - numberOfAnnotations)) {
      p1 = _getCoordinates(graphicData, offset, commonZCoordinate)
    } else {
      p1 = _getCoordinates(graphicData, j + numberOfAnnotations, commonZCoordinate)
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
  _getCentroid,
  _getCommonZCoordinate,
  _getCoordinateDimensionality
}
