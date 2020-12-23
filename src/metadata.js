import { keywordToTag, tagToKeyword } from './dictionary';

/** Determines the mapping of pyramid tile positions to frame numbers.
 *
 * @param {Object} Formatted metadata of a VL Whole Slide Microscopy Image instance
 * @returns {Object} Mapping of pyramid tile position (Row-Column) to frame URI
 * @private
 */
function getFrameMapping(metadata) {
  const rows = metadata.Rows;
  const columns = metadata.Columns;
  const totalPixelMatrixColumns = metadata.TotalPixelMatrixColumns;
  const totalPixelMatrixRows = metadata.TotalPixelMatrixRows;
  const sopInstanceUID = metadata.SOPInstanceUID;
  let numberOfFrames = metadata.NumberOfFrames || 1;
  numberOfFrames = Number(numberOfFrames);
  let frameOffsetNumber = metadata.ConcatenationFrameOffsetNumber || 0;
  frameOffsetNumber = Number(frameOffsetNumber);
  /*
   * The values "TILED_SPARSE" and "TILED_FULL" were introduced in the 2018
   * of the standard. Older datasets are equivalent to "TILED_SPARSE"
   * even though they may not have a value or a different value.
  */
  const dimensionOrganizationType = metadata.DimensionOrganizationType || 'TILED_SPARSE';
  const tilesPerRow = Math.ceil(totalPixelMatrixColumns / columns);
  const tilesPerColumn = Math.ceil(totalPixelMatrixRows / rows);
  const frameMapping = {};
  if (dimensionOrganizationType === 'TILED_FULL') {
    let offset = frameOffsetNumber + 1;
    let limit = frameOffsetNumber + numberOfFrames;
    for (let j = offset; j <= limit; j++) {
      let rowFraction = j / tilesPerRow;
      let rowIndex = Math.ceil(rowFraction);
      let colIndex = j - (rowIndex * tilesPerRow) + tilesPerRow;
      let index = rowIndex + '-' + colIndex;
      let frameNumber = j - offset + 1;
      frameMapping[index] = `${sopInstanceUID}/frames/${frameNumber}`;
    }
  } else {
    const functionalGroups = metadata.PerFrameFunctionalGroupsSequence;
    for (let j = 0; j < numberOfFrames; j++) {
      let planePositions = functionalGroups[j].PlanePositionSlideSequence[0];
      let rowPosition = planePositions.RowPositionInTotalImagePixelMatrix;
      let columnPosition = planePositions.ColumnPositionInTotalImagePixelMatrix;
      let rowIndex = Math.ceil(rowPosition / rows);
      let colIndex = Math.ceil(columnPosition / columns);
      let index = rowIndex + '-' + colIndex;
      let frameNumber = j + 1;
      frameMapping[index] = `${sopInstanceUID}/frames/${frameNumber}`;
    }
  }
  return frameMapping;
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
function formatMetadata(metadata) {
  const origin = {
    YOffsetInSlideCoordinateSystem: 0,
    XOffsetInSlideCoordinateSystem: 0
  };

  const loadJSONDataset = (elements) => {
    const dataset = {};
    Object.keys(elements).forEach(tag => {
      const keyword = tagToKeyword[tag];
      const vr = elements[tag]['vr'];

      /** Calculate offsets if TotalPixelMatrixOriginSequence not present */
      if (keyword === 'PlanePositionSlideSequence') {
        const value = elements[tag]['Value'][0];
        const col = value['0048021E'].Value[0];
        const row = value['0048021F'].Value[0];
        if (row === col && col === 1) {
          origin.YOffsetInSlideCoordinateSystem = value['0040073A'].Value[0];
          origin.XOffsetInSlideCoordinateSystem = value['0040072A'].Value[0];
        }
      }

      if ('BulkDataURI' in elements[tag]) {
        console.debug(`skip bulk data element "${keyword}"`)
      } else if ('Value' in elements[tag]) {
        const value = elements[tag]['Value'];
        if (vr === 'SQ') {
          dataset[keyword] = value.map(item => loadJSONDataset(item));
        } else {
          // Handle value multiplicity.
          if (value.length === 1) {
            if (vr === 'DS' || vr === 'IS') {
              dataset[keyword] = Number(value[0]);
            } else {
              dataset[keyword] = value[0];
            }
          } else {
            if (vr === 'DS' || vr === 'IS') {
              dataset[keyword] = value.map(v => Number(v));
            } else {
              dataset[keyword] = value;
            }
          }
        }
      } else {
        if (vr === 'SQ') {
          dataset[keyword] = [];
        } else {
          dataset[keyword] = null;
        }
      }
    });
    return dataset;
  }

  const dataset = loadJSONDataset(metadata);

  const isTiledSparse = dataset.DimensionOrganizationType === 'TILED_SPARSE';
  if (isTiledSparse && !dataset.TotalPixelMatrixOriginSequence) {
    dataset.TotalPixelMatrixOriginSequence = [origin];
  }

  // The top level (lowest resolution) image may be a single frame image in
  // which case the "NumberOfFrames" attribute is optional. We include it for
  // consistency.
  if (dataset === undefined) {
    throw new Error('Could not format metadata: ', metadata)
  }
  if (!('NumberOfFrames' in dataset) && (dataset.Modality === 'SM')) {
    dataset.NumberOfFrames = 1;
  }

  return dataset;
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
   * @params {Object} options.metadata - Metadata in DICOM JSON format
   */
  constructor(options) {
    const dataset = formatMetadata(options.metadata);
    if (dataset.SOPClassUID !== '1.2.840.10008.5.1.4.1.1.77.1.6') {
      throw new Error(
        'Cannot construct VL Whole Slide Microscopy Image instance ' +
        `given dataset with SOP Class UID "${dataset.SOPClassUID}"`
      );
    }

    Object.assign(this, dataset);
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
  constructor(options) {
    const dataset = formatMetadata(options.metadata);
    if (dataset.SOPClassUID !== '1.2.840.10008.5.1.4.1.1.88.34') {
      throw new Error(
        'Cannot construct Comprehensive 3D SR instance ' +
        `given dataset with SOP Class UID "${dataset.SOPClassUID}"`
      );
    }

    Object.assign(this, dataset);
  }
}

export {
  Comprehensive3DSR,
  formatMetadata,
  getFrameMapping,
  VLWholeSlideMicroscopyImage,
};
