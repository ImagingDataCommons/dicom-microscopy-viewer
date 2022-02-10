import { tagToKeyword } from './dictionary'
import { SOPClassUIDs } from './enums'
import { _groupFramesPerMapping } from './mapping'

const _metadata = Symbol('metadata')
const _bulkdataReferences = Symbol('bulkdataReferences')

function _base64ToUint8Array (value) {
  const blob = window.atob(value)
  const array = new Uint8Array(blob.length)

  for (let i = 0; i < blob.length; i++) {
    array[i] = blob.charCodeAt(i)
  }

  return array
}

function _base64ToUint16Array (value) {
  const blob = window.atob(value)
  const n = Uint16Array.BYTES_PER_ELEMENT
  const length = blob.length / n
  const buffer = new ArrayBuffer(n)
  const view = new DataView(buffer)
  const array = new Uint16Array(length)

  let p = 0
  for (let i = 0; i < length; i++) {
    p = i * n
    for (let j = 0; j < n; j++) {
      view.setUint8(j, blob.charCodeAt(p + j))
    }
    array[i] = view.getUint16(0, true)
  }

  return array
}

function _base64ToUint32Array (value) {
  const blob = window.atob(value)
  const n = Uint32Array.BYTES_PER_ELEMENT
  const length = blob.length / n
  const buffer = new ArrayBuffer(n)
  const view = new DataView(buffer)
  const array = new Uint32Array(length)

  let p = 0
  for (let i = 0; i < length; i++) {
    p = i * n
    for (let j = 0; j < n; j++) {
      view.setUint8(j, blob.charCodeAt(p + j))
    }
    array[i] = view.getUint32(0, true)
  }

  return array
}

function _base64ToFloat32Array (value) {
  const blob = window.atob(value)
  const n = Float32Array.BYTES_PER_ELEMENT
  const length = blob.length / n
  const buffer = new ArrayBuffer(n)
  const view = new DataView(buffer)
  const array = new Float32Array(length)

  let p = 0
  for (let i = 0; i < length; i++) {
    p = i * n
    for (let j = 0; j < n; j++) {
      view.setUint8(j, blob.charCodeAt(p + j))
    }
    array[i] = view.getFloat32(0, true)
  }

  return array
}

function _base64ToFloat64Array (value) {
  const blob = window.atob(value)
  const n = Float64Array.BYTES_PER_ELEMENT
  const length = blob.length / n
  const buffer = new ArrayBuffer(n)
  const view = new DataView(buffer)
  const array = new Float64Array(length)

  let p = 0
  for (let i = 0; i < length; i++) {
    p = i * n
    for (let j = 0; j < n; j++) {
      view.setUint8(j, blob.charCodeAt(p + j))
    }
    array[i] = view.getFloat64(0, true)
  }

  return array
}

/** Determines the mapping of pyramid tile positions to frame numbers.
 *
 * @param {Object} Formatted metadata of a VL Whole Slide Microscopy Image instance
 * @returns {Object} Mapping of pyramid tile position (Row-Column) to frame URI
 * @private
 */
function getFrameMapping (metadata) {
  const rows = metadata.Rows
  const columns = metadata.Columns
  const totalPixelMatrixColumns = metadata.TotalPixelMatrixColumns
  const sopInstanceUID = metadata.SOPInstanceUID
  const numberOfFrames = Number(metadata.NumberOfFrames || 1)
  const frameOffsetNumber = Number(metadata.ConcatenationFrameOffsetNumber || 0)

  /**
   * Handle images that may contain multiple "planes"
   *  - z-planes (VL Whole Slide Microscopy Image)
   *  - optical paths (VL Whole Slide Microscopy Image)
   *  - segments (Segmentation)
   *  - mappings (Parametric Map)
   */
  let numberOfChannels = 0
  const numberOfFocalPlanes = Number(metadata.TotalPixelMatrixFocalPlanes || 1)
  if (numberOfFocalPlanes > 1) {
    throw new Error('Images with multiple focal planes are not yet supported.')
  }

  const {
    mappingNumberToFrameNumbers,
    frameNumberToMappingNumber
  } = _groupFramesPerMapping(metadata)
  let numberOfOpticalPaths = 0
  let numberOfSegments = 0
  let numberOfMappings = 0
  if (metadata.NumberOfOpticalPaths !== undefined) {
    numberOfOpticalPaths = Number(metadata.NumberOfOpticalPaths || 1)
    numberOfChannels = numberOfOpticalPaths
  } else if (metadata.SegmentSequence !== undefined) {
    numberOfSegments = metadata.SegmentSequence.length
    numberOfChannels = numberOfSegments
  } else if (Object.keys(mappingNumberToFrameNumbers).length > 0) {
    numberOfMappings = Object.keys(mappingNumberToFrameNumbers).length
    numberOfChannels = numberOfMappings
  } else {
    throw new Error('Could not determine the number of image channels.')
  }

  const tilesPerRow = Math.ceil(totalPixelMatrixColumns / columns)
  const frameMapping = {}
  /**
   * The values "TILED_SPARSE" and "TILED_FULL" were introduced in the 2018
   * edition of the standard. Older datasets are equivalent to "TILED_SPARSE".
   */
  const dimensionOrganizationType = (
    metadata.DimensionOrganizationType || 'TILED_SPARSE'
  )
  if (dimensionOrganizationType === 'TILED_FULL') {
    const offset = frameOffsetNumber + 1
    const limit = frameOffsetNumber + numberOfFrames
    for (let j = offset; j <= limit; j++) {
      const rowIndex = Math.ceil(j / (tilesPerRow * numberOfChannels))
      const n = (
        j -
        (rowIndex * tilesPerRow * numberOfChannels) +
        (tilesPerRow * numberOfChannels)
      )
      const colIndex = Math.ceil(n / numberOfChannels)
      const channelIndex = Math.ceil(n / tilesPerRow)
      let channelIdentifier
      if (numberOfOpticalPaths > 0) {
        const opticalPath = metadata.OpticalPathSequence[channelIndex - 1]
        channelIdentifier = opticalPath.OpticalPathIdentifier
      } else if (numberOfSegments > 0) {
        const segment = metadata.SegmentIdentificationSequence[channelIndex - 1]
        channelIdentifier = String(segment.ReferencedSegmentNumber)
      } else if (numberOfMappings > 0) {
        // TODO: ensure that frames are mapped accordingly
        channelIdentifier = String(frameNumberToMappingNumber[j + 1])
      } else {
        throw new Error(`Could not determine channel of frame ${j}.`)
      }
      const index = rowIndex + '-' + colIndex + '-' + channelIdentifier
      const frameNumber = j - offset + 1
      frameMapping[index] = `${sopInstanceUID}/frames/${frameNumber}`
    }
  } else {
    const functionalGroups = metadata.PerFrameFunctionalGroupsSequence
    for (let j = 0; j < numberOfFrames; j++) {
      const planePositions = functionalGroups[j].PlanePositionSlideSequence[0]
      const rowPosition = planePositions.RowPositionInTotalImagePixelMatrix
      const columnPosition = planePositions.ColumnPositionInTotalImagePixelMatrix
      const rowIndex = Math.ceil(rowPosition / rows)
      const colIndex = Math.ceil(columnPosition / columns)
      let channelIdentifier
      if (numberOfOpticalPaths > 0) {
        const opticalPath = functionalGroups[j].OpticalPathIdentificationSequence[0]
        channelIdentifier = opticalPath.OpticalPathIdentifier
      } else if (numberOfSegments > 0) {
        const segment = functionalGroups[j].SegmentIdentificationSequence[0]
        channelIdentifier = String(segment.ReferencedSegmentNumber)
      } else if (numberOfMappings > 0) {
        channelIdentifier = String(frameNumberToMappingNumber[j + 1])
      } else {
        throw new Error(`Could not determine channel of frame ${j}.`)
      }
      const index = rowIndex + '-' + colIndex + '-' + channelIdentifier
      const frameNumber = j + 1
      frameMapping[index] = `${sopInstanceUID}/frames/${frameNumber}`
    }
  }
  return {
    frameMapping,
    numberOfChannels
  }
}

/** Formats DICOM metadata structured according to the DICOM JSON model into a
 * more human friendly representation, where values of data elements can be
 * directly accessed via their keyword (e.g., "SOPInstanceUID").
 * Bulkdata elements will be skipped.
 *
 * @param {Object} metadata - Metadata structured according to the DICOM JSON model
 * @param {Object} Metadata structured according to the DICOM JSON model
 * @returns {Object} Formatted dataset and remaining bulkdata
 *
 * @memberof metadata
 */
function formatMetadata (metadata) {
  const loadJSONDataset = (elements) => {
    const dataset = {}
    const bulkdataReferences = {}
    Object.keys(elements).forEach(tag => {
      const keyword = tagToKeyword[tag]
      const vr = elements[tag].vr
      if ('BulkDataURI' in elements[tag]) {
        bulkdataReferences[keyword] = elements[tag]
      } else if ('Value' in elements[tag]) {
        const value = elements[tag].Value
        if (vr === 'SQ') {
          dataset[keyword] = []
          const mappings = []
          value.forEach(item => {
            const loaded = loadJSONDataset(item)
            dataset[keyword].push(loaded.dataset)
            mappings.push(loaded.bulkdataReferences)
          })
          if (mappings.some(item => Object.keys(item).length > 0)) {
            bulkdataReferences[keyword] = mappings
          }
        } else {
          // Handle value multiplicity.
          if (value.length === 1) {
            if (vr === 'DS' || vr === 'IS') {
              dataset[keyword] = Number(value[0])
            } else {
              dataset[keyword] = value[0]
            }
          } else {
            if (vr === 'DS' || vr === 'IS') {
              dataset[keyword] = value.map(v => Number(v))
            } else {
              dataset[keyword] = value
            }
          }
        }
      } else if ('InlineBinary' in elements[tag]) {
        const value = elements[tag].InlineBinary
        if (vr === 'OB') {
          dataset[keyword] = _base64ToUint8Array(value)
        } else if (vr === 'OW') {
          dataset[keyword] = _base64ToUint16Array(value)
        } else if (vr === 'OL') {
          dataset[keyword] = _base64ToUint32Array(value)
        } else if (vr === 'OF') {
          dataset[keyword] = _base64ToFloat32Array(value)
        } else if (vr === 'OD') {
          dataset[keyword] = _base64ToFloat64Array(value)
        }
      } else {
        if (vr === 'SQ') {
          dataset[keyword] = []
        } else {
          dataset[keyword] = null
        }
      }
    })
    return { dataset, bulkdataReferences }
  }

  const { dataset, bulkdataReferences } = loadJSONDataset(metadata)

  // The top level (lowest resolution) image may be a single frame image in
  // which case the "NumberOfFrames" attribute is optional. We include it for
  // consistency.
  if (dataset === undefined) {
    throw new Error('Could not format metadata: ', metadata)
  }
  if (!('NumberOfFrames' in dataset) && (dataset.Modality === 'SM')) {
    dataset.NumberOfFrames = 1
  }

  return { dataset, bulkdataReferences }
}

/**
 * Group DICOM metadata of monochrome slides by Optical Path Identifier.
 *
 * @param {Object[]} images - DICOM VL Whole Slide Microscopy Image instances.
 *
 * @returns {Object[][]} Groups of DICOM VL Whole Slide Microscopy Image instances
 * @memberof metadata
 */
function groupMonochromeInstances (images) {
  const channels = []
  for (let i = 0; i < images.length; ++i) {
    if (images[i].ImageType[2] !== 'VOLUME') {
      continue
    }

    if (images[i].SamplesPerPixel === 1 &&
        images[i].PhotometricInterpretation === 'MONOCHROME2'
    ) {
      const opticalPathIdentifier = (
        images[i]
          .OpticalPathSequence[0]
          .OpticalPathIdentifier
      )
      const group = channels.find(group => {
        const currentOpticalPathIdentifier = (
          group[0]
            .OpticalPathSequence[0]
            .OpticalPathIdentifier
        )
        return currentOpticalPathIdentifier === opticalPathIdentifier
      })

      if (group) {
        group.push(images[i])
      } else {
        const group = [images[i]]
        channels.push(group)
      }
    }
  }

  return channels
}

/**
 * Group DICOM metadata of color images slides by Optical Path Identifier.
 *
 * @param {Object[]} images - DICOM VL Whole Slide Microscopy Image instances.
 *
 * @returns {Object[][]} Groups of DICOM VL Whole Slide Microscopy Image instances
 * @memberof metadata
 */
function groupColorInstances (images) {
  const colorImages = []
  for (let i = 0; i < images.length; ++i) {
    if (
      images[i].ImageType[2] === 'LABEL' ||
      images[i].ImageType[2] === 'OVERVIEW'
    ) {
      continue
    }

    if (
      images[i].SamplesPerPixel !== 1 &&
      (
        images[i].PhotometricInterpretation === 'RGB' ||
        images[i].PhotometricInterpretation.includes('YBR')
      )
    ) {
      const opticalPathIdentifier = (
        images[i]
          .OpticalPathSequence[0]
          .OpticalPathIdentifier
      )
      const group = colorImages.find(group => {
        const currentOpticalPathIdentifier = (
          group[0]
            .OpticalPathSequence[0]
            .OpticalPathIdentifier
        )
        return currentOpticalPathIdentifier === opticalPathIdentifier
      })

      if (group) {
        group.push(images[i])
      } else {
        const group = [images[i]]
        colorImages.push(group)
      }
    }
  }

  return colorImages
}

class SOPClass {
  constructor ({ metadata }) {
    if (metadata == null) {
      throw new Error(
        'Cannot construct SOP Instance because no metadata was provided.'
      )
    }
    const { dataset, bulkdataReferences } = formatMetadata(metadata)
    Object.assign(this, dataset)
    this[_metadata] = metadata
    this[_bulkdataReferences] = bulkdataReferences
    Object.freeze(this)
  }

  get json () {
    return this[_metadata]
  }

  get bulkdataReferences () {
    return this[_bulkdataReferences]
  }
}

/** DICOM VL Whole Slide Microscopy Image instance
 * (without Pixel Data or any other bulk data).
 *
 * @class
 * @memberof metadata
 */
class VLWholeSlideMicroscopyImage extends SOPClass {
  /**
   * @params {Object} options
   * @params {Object} options.metadata - Metadata of a VL Whole Slide Microscopy Image in DICOM JSON format
   */
  constructor ({ metadata }) {
    super({ metadata })
    if (this.SOPClassUID !== SOPClassUIDs.VL_WHOLE_SLIDE_MICROSCOPY_IMAGE) {
      throw new Error(
        'Cannot construct VL Whole Slide Microscopy Image instance ' +
        `given dataset with SOP Class UID "${this.SOPClassUID}"`
      )
    }
  }
}

/** DICOM Comprehensive 3D SR instance.
 *
 * @class
 * @memberof metadata
 */
class Comprehensive3DSR extends SOPClass {
  /**
   * @params {Object} options
   * @params {Object} options.metadata - Metadata of DICOM Structured Report instance in DICOM JSON format
   */
  constructor ({ metadata }) {
    super({ metadata })
    if (this.SOPClassUID !== SOPClassUIDs.COMPREHENSIVE_3D_SR) {
      throw new Error(
        'Cannot construct Comprehensive 3D SR instance ' +
          `given dataset with SOP Class UID "${this.SOPClassUID}"`
      )
    }
  }
}

/** DICOM Microscopy Bulk Simple Annotations instance.
 *
 * @class
 * @memberof metadata
 */
class MicroscopyBulkSimpleAnnotations extends SOPClass {
  /**
   * @params {Object} options
   * @params {Object} options.metadata - Metadata of a DICOM Microscopy Bulk Simple Annotations instance in DICOM JSON format
   */
  constructor ({ metadata }) {
    super({ metadata })
    if (this.SOPClassUID !== SOPClassUIDs.MICROSCOPY_BULK_SIMPLE_ANNOTATIONS) {
      throw new Error(
        'Cannot construct Microscopy Bulk Simple Annotations instance ' +
          `given dataset with SOP Class UID "${this.SOPClassUID}"`
      )
    }
  }
}

/** DICOM Parametric Map instance.
 *
 * @class
 * @memberof metadata
 */
class ParametricMap extends SOPClass {
  /**
   * @params {Object} options
   * @params {Object} options.metadata - Metadata of a DICOM Parametric Map instance in DICOM JSON format
   */
  constructor ({ metadata }) {
    super({ metadata })
    if (this.SOPClassUID !== SOPClassUIDs.PARAMETRIC_MAP) {
      throw new Error(
        'Cannot construct Parametric Map instance ' +
          `given dataset with SOP Class UID "${this.SOPClassUID}"`
      )
    }
  }
}

/** DICOM Segmentation instance.
 *
 * @class
 * @memberof metadata
 */
class Segmentation extends SOPClass {
  /**
   * @params {Object} options
   * @params {Object} options.metadata - Metadata of a DICOM Segmentation instance in DICOM JSON format
   */
  constructor ({ metadata }) {
    super({ metadata })
    if (this.SOPClassUID !== SOPClassUIDs.SEGMENTATION) {
      throw new Error(
        'Cannot construct Segmentation instance ' +
        `given dataset with SOP Class UID "${this.SOPClassUID}"`
      )
    }
  }
}

export {
  Comprehensive3DSR,
  formatMetadata,
  groupMonochromeInstances,
  groupColorInstances,
  getFrameMapping,
  MicroscopyBulkSimpleAnnotations,
  ParametricMap,
  Segmentation,
  VLWholeSlideMicroscopyImage
}
