import { tagToKeyword } from './dictionary'
import { SOPClassUIDs } from './enums'
import { _groupFramesPerMapping } from './mapping'

const _metadata = Symbol('metadata')
const _bulkdataReferences = Symbol('bulkdataReferences')

function _base64ToUint8Array(value) {
  const blob = window.atob(value)
  const array = new Uint8Array(blob.length)

  for (let i = 0; i < blob.length; i++) {
    array[i] = blob.charCodeAt(i)
  }

  return array
}

function _base64ToUint16Array(value) {
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

function _base64ToUint32Array(value) {
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

function _base64ToFloat32Array(value) {
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

function _base64ToFloat64Array(value) {
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

/** Determine the mapping of pyramid tile positions to frame numbers.
 *
 * @param {Object} Formatted metadata of a VL Whole Slide Microscopy Image instance
 * @returns {Object} Mapping of pyramid tile position (Row-Column) to frame URI
 * @private
 */
function getFrameMapping(metadata) {
  const rows = metadata.Rows
  const columns = metadata.Columns
  const totalPixelMatrixColumns = metadata.TotalPixelMatrixColumns
  const totalPixelMatrixRows = metadata.TotalPixelMatrixRows
  const sopInstanceUID = metadata.SOPInstanceUID
  const numberOfFrames = Number(metadata.NumberOfFrames || 1)

  /**
   * Handle images that may contain multiple "planes"
   *  - z-planes (VL Whole Slide Microscopy Image)
   *  - optical paths (VL Whole Slide Microscopy Image)
   *  - segments (Segmentation)
   *  - mappings (Parametric Map)
   */
  const numberOfFocalPlanes = Number(metadata.NumberOfFocalPlanes || 1)
  if (numberOfFocalPlanes > 1) {
    throw new Error('Images with multiple focal planes are not yet supported.')
  }

  const { mappingNumberToFrameNumbers, frameNumberToMappingNumber } =
    _groupFramesPerMapping(metadata)
  let numberOfChannels = 0
  let numberOfOpticalPaths = 0
  let numberOfSegments = 0
  let numberOfMappings = 0
  if (metadata.OpticalPathSequence != null) {
    numberOfOpticalPaths = Number(metadata.NumberOfOpticalPaths || 1)
    numberOfChannels = numberOfOpticalPaths
  } else if (metadata.SegmentSequence != null) {
    numberOfSegments = Number(metadata.SegmentSequence.length)
    numberOfChannels = numberOfSegments
  } else if (Object.keys(mappingNumberToFrameNumbers).length > 0) {
    numberOfMappings = Number(Object.keys(mappingNumberToFrameNumbers).length)
    numberOfChannels = numberOfMappings
  } else {
    throw new Error('Could not determine the number of image channels.')
  }

  const tileColumns = Math.ceil(totalPixelMatrixColumns / columns)
  const tileRows = Math.ceil(totalPixelMatrixRows / rows)
  const frameMapping = {}
  /**
   * The values "TILED_SPARSE" and "TILED_FULL" were introduced in the 2018
   * edition of the standard. Older datasets are equivalent to "TILED_SPARSE".
   */
  const dimensionOrganizationType =
    metadata.DimensionOrganizationType || 'TILED_SPARSE'
  if (dimensionOrganizationType === 'TILED_FULL') {
    let number = 1
    // Forth, along "channels"
    for (let i = 0; i < numberOfChannels; i++) {
      // Third, along the depth direction from glass slide -> coverslip
      for (let p = 0; p < numberOfFocalPlanes; p++) {
        // Second, along the column direction from top -> bottom
        for (let r = 0; r < tileRows; r++) {
          // First, along the row direction from left -> right
          for (let c = 0; c < tileColumns; c++) {
            /*
             * The standard currently only defines TILED_FULL for optical paths
             * and not any other types of "channels" such as segments or
             * parameter mappings.
             */
            let channelIdentifier
            if (numberOfOpticalPaths > 0) {
              const opticalPath = metadata.OpticalPathSequence[i]
              channelIdentifier = String(opticalPath.OpticalPathIdentifier)
            } else if (numberOfSegments > 0) {
              const segment = metadata.SegmentSequence[i]
              channelIdentifier = String(segment.SegmentNumber)
            } else if (numberOfMappings > 0) {
              // TODO: ensure that frames are mapped accordingly
              channelIdentifier = String(frameNumberToMappingNumber[number])
            } else {
              throw new Error(
                `Could not determine channel of frame #${number}.`,
              )
            }
            const key = `${r + 1}-${c + 1}-${channelIdentifier}`
            frameMapping[key] = `${sopInstanceUID}/frames/${number}`
            number += 1
          }
        }
      }
    }
  } else {
    const sharedFuncGroups = metadata.SharedFunctionalGroupsSequence
    const perframeFuncGroups = metadata.PerFrameFunctionalGroupsSequence
    for (let j = 0; j < numberOfFrames; j++) {
      const planePositions = perframeFuncGroups[j].PlanePositionSlideSequence[0]
      const rowPosition = planePositions.RowPositionInTotalImagePixelMatrix
      const columnPosition =
        planePositions.ColumnPositionInTotalImagePixelMatrix
      const rowIndex = Math.ceil(rowPosition / rows)
      const colIndex = Math.ceil(columnPosition / columns)
      const number = j + 1
      let channelIdentifier
      if (numberOfOpticalPaths === 1) {
        try {
          channelIdentifier = String(
            sharedFuncGroups[0].OpticalPathIdentificationSequence[0]
              .OpticalPathIdentifier,
          )
        } catch {
          channelIdentifier = String(
            perframeFuncGroups[j].OpticalPathIdentificationSequence[0]
              .OpticalPathIdentifier,
          )
        }
      } else if (numberOfOpticalPaths > 1) {
        channelIdentifier = String(
          perframeFuncGroups[j].OpticalPathIdentificationSequence[0]
            .OpticalPathIdentifier,
        )
      } else if (numberOfSegments === 1) {
        try {
          channelIdentifier = String(
            sharedFuncGroups[0].SegmentIdentificationSequence[0]
              .ReferencedSegmentNumber,
          )
        } catch {
          channelIdentifier = String(
            perframeFuncGroups[j].SegmentIdentificationSequence[0]
              .ReferencedSegmentNumber,
          )
        }
      } else if (numberOfSegments > 1) {
        channelIdentifier = String(
          perframeFuncGroups[j].SegmentIdentificationSequence[0]
            .ReferencedSegmentNumber,
        )
      } else if (numberOfMappings > 0) {
        channelIdentifier = String(frameNumberToMappingNumber[number])
      } else {
        throw new Error(`Could not determine channel of frame ${number}.`)
      }
      const key = `${rowIndex}-${colIndex}-${channelIdentifier}`
      const frameNumber = j + 1
      frameMapping[key] = `${sopInstanceUID}/frames/${frameNumber}`
    }
  }
  return {
    frameMapping,
    numberOfChannels,
  }
}

/**
 * Format DICOM metadata structured according to the DICOM JSON model.
 *
 * Transforms the DICOM JSON representation into a more human friendly
 * representation, where values of data elements can be directly accessed via
 * their keyword (e.g., "SOPInstanceUID").
 * Bulkdata elements will be extracted and returned as a separate mapping.
 *
 * @param {Object} metadata - Metadata structured according to the DICOM JSON model
 *
 * @returns {Object} Formatted dataset and remaining bulkdata
 *
 * @memberof metadata
 */
function formatMetadata(metadata) {
  const loadJSONDataset = (elements) => {
    const dataset = {}
    const bulkdataReferences = {}
    Object.keys(elements).forEach((tag) => {
      const keyword = tagToKeyword[tag] || tag
      const vr = elements[tag].vr
      if ('BulkDataURI' in elements[tag]) {
        bulkdataReferences[keyword] = elements[tag]
      } else if ('Value' in elements[tag]) {
        const value = elements[tag].Value
        if (vr === 'SQ') {
          dataset[keyword] = []
          const mappings = []
          value.forEach((item) => {
            const loaded = loadJSONDataset(item)
            dataset[keyword].push(loaded.dataset)
            mappings.push(loaded.bulkdataReferences)
          })
          if (mappings.some((item) => Object.keys(item).length > 0)) {
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
              dataset[keyword] = value.map((v) => Number(v))
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
  if (!('NumberOfFrames' in dataset) && dataset.Modality === 'SM') {
    dataset.NumberOfFrames = 1
  }

  return { dataset, bulkdataReferences }
}

/**
 * Group DICOM metadata of monochrome slides by Optical Path Identifier.
 *
 * @param {metadata.VLWholeSlideMicroscopyImage[]} images - DICOM VL Whole
 * Slide Microscopy Image instances.
 *
 * @returns {Object} Groups of DICOM VL Whole Slide Microscopy Image instances
 * @memberof metadata
 */
function groupMonochromeInstances(images) {
  const channels = {}
  images.forEach((img) => {
    if (
      img.SamplesPerPixel === 1 &&
      img.PhotometricInterpretation === 'MONOCHROME2' &&
      (img.ImageType[2] === 'VOLUME' || img.ImageType[2] === 'THUMBNAIL')
    ) {
      img.OpticalPathSequence.forEach((opticalPathItem, _opticalPathIndex) => {
        const id = opticalPathItem.OpticalPathIdentifier
        if (id in channels) {
          channels[id].push(img)
        } else {
          channels[id] = [img]
        }
      })
    }
  })
  return channels
}

/**
 * Group DICOM metadata of color images slides by Optical Path Identifier.
 *
 * @param {metadata.VLWholeSlideMicroscopyImage[]} images - DICOM VL Whole
 * Slide Microscopy Image instances.
 *
 * @returns {Object} Groups of DICOM VL Whole Slide Microscopy Image instances
 * @memberof metadata
 */
function groupColorInstances(images) {
  const channels = {}
  images.forEach((img) => {
    if (
      img.SamplesPerPixel !== 1 &&
      (img.ImageType[2] === 'THUMBNAIL' || img.ImageType[2] === 'VOLUME') &&
      (img.PhotometricInterpretation === 'RGB' ||
        img.PhotometricInterpretation.includes('YBR'))
    ) {
      const id = img.OpticalPathSequence[0].OpticalPathIdentifier
      if (id in channels) {
        channels[id].push(img)
      } else {
        channels[id] = [img]
      }
    }
  })
  return channels
}

/**
 * DICOM Service Object Pair (SOP) Class.
 *
 * @class
 * @abstract
 * @memberof metadata
 */
class SOPClass {
  /**
   * @param {Object} options
   * @param {Object} options.metadata - Metadata of a DICOM SOP instance in DICOM JSON format
   */
  constructor({ metadata }) {
    if (metadata == null) {
      throw new Error(
        'Cannot construct SOP Instance because no metadata was provided.',
      )
    }
    const { dataset, bulkdataReferences } = formatMetadata(metadata)
    Object.assign(this, dataset)
    this[_metadata] = metadata
    this[_bulkdataReferences] = bulkdataReferences
    Object.freeze(this)
  }

  /**
   * Get metadata of instance in DICOM JSON format.
   *
   * The metadata may include bulkdata references via "BulkDataURI".
   *
   * @returns {Object} metadata in DICOM JSON format
   */
  get json() {
    return this[_metadata]
  }

  /**
   * Get references to bulkdata of instance in DICOM JSON format.
   *
   * @returns {Object} bulkdata references in DICOM JSON format
   */
  get bulkdataReferences() {
    return this[_bulkdataReferences]
  }
}

/**
 * DICOM VL Whole Slide Microscopy Image instance.
 *
 * @class
 * @extends metadata.SOPClass
 * @memberof metadata
 */
class VLWholeSlideMicroscopyImage extends SOPClass {
  /**
   * @param {Object} options
   * @param {Object} options.metadata - Metadata of a VL Whole Slide Microscopy Image in DICOM JSON format
   */
  constructor({ metadata }) {
    super({ metadata })
    if (this.SOPClassUID !== SOPClassUIDs.VL_WHOLE_SLIDE_MICROSCOPY_IMAGE) {
      throw new Error(
        'Cannot construct VL Whole Slide Microscopy Image instance ' +
          `given dataset with SOP Class UID "${this.SOPClassUID}"`,
      )
    }
  }
}

/**
 * DICOM Comprehensive 3D SR instance.
 *
 * @class
 * @extends metadata.SOPClass
 * @memberof metadata
 */
class Comprehensive3DSR extends SOPClass {
  /**
   * @param {Object} options
   * @param {Object} options.metadata - Metadata of DICOM Structured Report instance in DICOM JSON format
   */
  constructor({ metadata }) {
    super({ metadata })
    if (this.SOPClassUID !== SOPClassUIDs.COMPREHENSIVE_3D_SR) {
      throw new Error(
        'Cannot construct Comprehensive 3D SR instance ' +
          `given dataset with SOP Class UID "${this.SOPClassUID}"`,
      )
    }
  }
}

/**
 * DICOM Microscopy Bulk Simple Annotations instance.
 *
 * @class
 * @extends metadata.SOPClass
 * @memberof metadata
 */
class MicroscopyBulkSimpleAnnotations extends SOPClass {
  /**
   * @param {Object} options
   * @param {Object} options.metadata - Metadata of a DICOM Microscopy Bulk Simple Annotations instance in DICOM JSON format
   */
  constructor({ metadata }) {
    super({ metadata })
    if (this.SOPClassUID !== SOPClassUIDs.MICROSCOPY_BULK_SIMPLE_ANNOTATIONS) {
      throw new Error(
        'Cannot construct Microscopy Bulk Simple Annotations instance ' +
          `given dataset with SOP Class UID "${this.SOPClassUID}"`,
      )
    }
  }
}

/**
 * DICOM Parametric Map instance.
 *
 * @class
 * @extends metadata.SOPClass
 * @memberof metadata
 */
class ParametricMap extends SOPClass {
  /**
   * @param {Object} options
   * @param {Object} options.metadata - Metadata of a DICOM Parametric Map instance in DICOM JSON format
   */
  constructor({ metadata }) {
    super({ metadata })
    if (this.SOPClassUID !== SOPClassUIDs.PARAMETRIC_MAP) {
      throw new Error(
        'Cannot construct Parametric Map instance ' +
          `given dataset with SOP Class UID "${this.SOPClassUID}"`,
      )
    }
  }
}

/**
 * DICOM Segmentation instance.
 *
 * @class
 * @extends metadata.SOPClass
 * @memberof metadata
 */
class Segmentation extends SOPClass {
  /**
   * @param {Object} options
   * @param {Object} options.metadata - Metadata of a DICOM Segmentation instance in DICOM JSON format
   */
  constructor({ metadata }) {
    super({ metadata })
    if (this.SOPClassUID !== SOPClassUIDs.SEGMENTATION) {
      throw new Error(
        'Cannot construct Segmentation instance ' +
          `given dataset with SOP Class UID "${this.SOPClassUID}"`,
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
  VLWholeSlideMicroscopyImage,
}
