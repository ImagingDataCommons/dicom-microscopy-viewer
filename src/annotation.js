const _attrs = Symbol('attrs')
import { getContentItemNameCodedConcept } from './utils.js'

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

async function fetchGraphicData ({ metadataItem, bulkdataItem, client }) {
  const uid = metadataItem.AnnotationGroupUID
  const graphicType = metadataItem.GraphicType
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

async function fetchGraphicIndex ({ metadataItem, bulkdataItem, client }) {
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

async function fetchMeasurements ({ metadataItem, bulkdataItem, client }) {
  const uid = metadataItem.AnnotationGroupUID
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

export {
  AnnotationGroup,
  fetchGraphicData,
  fetchGraphicIndex,
  fetchMeasurements,
}
