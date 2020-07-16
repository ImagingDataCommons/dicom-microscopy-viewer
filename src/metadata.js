import { keywordToTag, tagToKeyword } from './dictionary';

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


function formatImageMetadata(metadata) {

  const sopClassUID = metadata['00080016']['Value'][0];
  if (sopClassUID !== '1.2.840.10008.5.1.4.1.1.77.1.6') {
    throw new Error('SOP Class UID "' + sopClassUID + '" is not supported');
  }

  const imageType = metadata['00080008']['Value'];

  const loadJSONDataset = (elements) => {
    const dataset = {};
    Object.keys(elements).forEach(tag => {
      const keyword = tagToKeyword[tag];
      const vr = elements[tag]['vr'];
      if ('BulkDataURI' in elements[tag]) {
        console.debug(`skip bulk data element "${keyword}"`)
      } else if ('Value' in elements[tag]) {
        const value = elements[tag]['Value'];
        if (vr === 'SQ') {
          dataset[keyword] = value.map(item => {
            return loadJSONDataset(item);
          });
        } else {
          // Handle value multiplicity.
          if (value.length === 1) {
            dataset[keyword] = value[0];
          } else {
            dataset[keyword] = value;
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

  // The top level (lowest resolution) image may be a single frame image in
  // which case the "NumberOfFrames" attribute is optional. We include it for
  // consistency.
  if (!('NumberOfFrames' in dataset)) {
    dataset.NumberOfFrames = 1;
  }

  return dataset;
}

export { formatImageMetadata, getFrameMapping };
