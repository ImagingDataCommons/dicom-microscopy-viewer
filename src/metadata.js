import { tagToKeyword } from './dictionary'
import { SOPClassUIDs } from './enums'
import { _groupFramesPerMapping } from './mapping'

/** Determines the mapping of pyramid tile positions to frame numbers.
 *
 * @param {Object} Formatted metadata of a VL Whole Slide Microscopy Image instance
 * @returns {Object} Mapping of pyramid tile position (Row-Column) to frame URI
 * @private
 */
function getFrameMapping (metadata) {
  const rows = metadata.Rows
  const columns = metadata.Columns
  const totalPixelMatrixRows = metadata.TotalPixelMatrixRows
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
  } else if (mappingNumberToFrameNumbers.length > 0) {
    numberOfMappings = mappingNumberToFrameNumbers.length
    numberOfChannels = numberOfMappings
  } else {
    throw new Error('Could not determine the number of image channels.')
  }

  const tilesPerRow = Math.ceil(totalPixelMatrixColumns / columns)
  const tilesPerCol = Math.ceil(totalPixelMatrixRows / rows)
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
 * @param {Object} Metadata structured according to the DICOM JSON model
 * @returns {Object} Formatted metadata
 * @memberof metadata
 */
function formatMetadata (metadata) {
  const loadJSONDataset = (elements) => {
    const dataset = {}
    Object.keys(elements).forEach(tag => {
      const keyword = tagToKeyword[tag]
      const vr = elements[tag].vr
      if ('BulkDataURI' in elements[tag]) {
        console.debug(`skip bulk data element "${keyword}"`)
      } else if ('Value' in elements[tag]) {
        const value = elements[tag].Value
        if (vr === 'SQ') {
          dataset[keyword] = value.map(item => loadJSONDataset(item))
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
      } else {
        if (vr === 'SQ') {
          dataset[keyword] = []
        } else {
          dataset[keyword] = null
        }
      }
    })
    return dataset
  }

  const dataset = loadJSONDataset(metadata)

  // The top level (lowest resolution) image may be a single frame image in
  // which case the "NumberOfFrames" attribute is optional. We include it for
  // consistency.
  if (dataset === undefined) {
    throw new Error('Could not format metadata: ', metadata)
  }
  if (!('NumberOfFrames' in dataset) && (dataset.Modality === 'SM')) {
    dataset.NumberOfFrames = 1
  }

  return dataset
}

/** Group DICOM metadata of monochrome slides by Optical Path Identifier.
 *
 * @param {Object[]} metadata - DICOM JSON objects representing metadata of VL Whole Slide Microscopy Image instances.
 *
 * @returns {Object[]} Groups of formatted VLWholeSlideMicroscopyImage instances
 * @memberof metadata
 */
function groupMonochromeInstances (metadata) {
  const channels = []
  for (let i = 0; i < metadata.length; ++i) {
    const microscopyImage = new VLWholeSlideMicroscopyImage({
      metadata: metadata[i]
    })
    if (microscopyImage.ImageType[2] !== 'VOLUME') {
      continue
    }

    if (microscopyImage.SamplesPerPixel === 1 &&
        microscopyImage.PhotometricInterpretation === 'MONOCHROME2') {
      // this is a monochrome channel
      const pathIdentifier = microscopyImage.OpticalPathSequence[0].OpticalPathIdentifier
      const channel = channels.find(channel => {
        return channel[0].OpticalPathSequence[0].OpticalPathIdentifier === pathIdentifier
      })

      if (channel) {
        channel.push(microscopyImage)
      } else {
        channels.push([microscopyImage])
      }
    }
  }

  return channels
}

/** Group DICOM metadata of color images slides by Optical Path Identifier.
 *
 * @param {Object[]} metadata
 *
 * @returns {Object[]} groups of VLWholeSlideMicroscopyImages
 * @memberof metadata
 */
function groupColorInstances (metadata) {
  const colorImages = []
  for (let i = 0; i < metadata.length; ++i) {
    const microscopyImage = new VLWholeSlideMicroscopyImage({
      metadata: metadata[i]
    })
    if (
      microscopyImage.ImageType[2] === 'LABEL' ||
      microscopyImage.ImageType[2] === 'OVERVIEW'
    ) {
      continue
    }

    if (
      microscopyImage.SamplesPerPixel !== 1 &&
      (
        microscopyImage.PhotometricInterpretation === 'RGB' ||
        microscopyImage.PhotometricInterpretation.includes('YBR')
      )
    ) {
      const opticalPathIdentifier = (
        microscopyImage
          .OpticalPathSequence[0]
          .OpticalPathIdentifier
      )
      const colorImage = colorImages.find(images => {
        const currentOpticalPathIdentifier = (
          images[0]
            .OpticalPathSequence[0]
            .OpticalPathIdentifier
        )
        return currentOpticalPathIdentifier === opticalPathIdentifier
      })

      if (colorImage) {
        colorImage.push(microscopyImage)
      } else {
        colorImages.push([microscopyImage])
      }
    }
  }

  return colorImages
}

/** DICOM VL Whole Slide Microscopy Image instance
 * (without Pixel Data or any other bulk data).
 *
 * @class
 * @memberof metadata
 */
class VLWholeSlideMicroscopyImage {
  /**
     * @params {Object} options
     * @params {Object} options.metadata - Metadata of a VL Whole Slide Microscopy Image in DICOM JSON format
     */
  constructor (options) {
    let dataset
    if ('StudyInstanceUID' in options.metadata) {
      // Has already been formatted
      dataset = options.metadata
    } else {
      dataset = formatMetadata(options.metadata)
    }
    if (dataset.SOPClassUID !== SOPClassUIDs.VL_WHOLE_SLIDE_MICROSCOPY_IMAGE) {
      throw new Error(
        'Cannot construct VL Whole Slide Microscopy Image instance ' +
        `given dataset with SOP Class UID "${dataset.SOPClassUID}"`
      )
    }

    Object.assign(this, dataset)
  }
}

/** DICOM Comprehensive 3D SR instance.
 *
 * @class
 * @memberof metadata
 */
class Comprehensive3DSR {
  /**
     * @params {Object} options
     * @params {Object} options.metadata - Metadata in DICOM JSON format
     */
  constructor (options) {
    const dataset = formatMetadata(options.metadata)
    if (dataset.SOPClassUID !== SOPClassUIDs.COMPREHENSIVE_3D_SR) {
      throw new Error(
        'Cannot construct Comprehensive 3D SR instance ' +
          `given dataset with SOP Class UID "${dataset.SOPClassUID}"`
      )
    }

    Object.assign(this, dataset)
  }
}

/** DICOM Microscopy Bulk Simple Annotations instance.
 *
 * @class
 * @memberof metadata
 */
class MicroscopyBulkSimpleAnnotations {
  /**
     * @params {Object} options
     * @params {Object} options.metadata - Metadata in DICOM JSON format
     */
  constructor (options) {
    const dataset = formatMetadata(options.metadata)
    if (dataset.SOPClassUID !== SOPClassUIDs.MICROSCOPY_BULK_SIMPLE_ANNOTATIONS) {
      throw new Error(
        'Cannot construct Microscopy Bulk Simple Annotations instance ' +
          `given dataset with SOP Class UID "${dataset.SOPClassUID}"`
      )
    }

    Object.assign(this, dataset)
  }
}

/** DICOM Parametric Map instance.
 *
 * @class
 * @memberof metadata
 */
class ParametricMap {
  /**
     * @params {Object} options
     * @params {Object} options.metadata - Metadata in DICOM JSON format
     */
  constructor (options) {
    const dataset = formatMetadata(options.metadata)
    if (dataset.SOPClassUID !== SOPClassUIDs.PARAMETRIC_MAP) {
      throw new Error(
        'Cannot construct Parametric Map instance ' +
          `given dataset with SOP Class UID "${dataset.SOPClassUID}"`
      )
    }

    Object.assign(this, dataset)
  }
}

/** DICOM Segmentation instance.
 *
 * @class
 * @memberof metadata
 */
class Segmentation {
  /**
     * @params {Object} options
     * @params {Object} options.metadata - Metadata in DICOM JSON format
     */
  constructor (options) {
    const dataset = formatMetadata(options.metadata)
    if (dataset.SOPClassUID !== SOPClassUIDs.SEGMENTATION) {
      throw new Error(
        'Cannot construct Segmentation instance ' +
          `given dataset with SOP Class UID "${dataset.SOPClassUID}"`
      )
    }

    Object.assign(this, dataset)
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
