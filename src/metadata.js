import { keywordToTag, tagToKeyword } from './dictionary';

function getFrameMapping(metadata) {
  const rows = metadata['00280010']['Value'][0];
  const columns = metadata['00280011']['Value'][0];
  const totalPixelMatrixColumns = metadata['00480006']['Value'][0];
  const totalPixelMatrixRows = metadata['00480007']['Value'][0];
  const sopInstanceUID = metadata['00080018']['Value'][0];
  let numberOfFrames = 1;
  if ('00280008' in metadata) {
    numberOfFrames = Number(metadata['00280008']['Value'][0]);
  }
  let frameOffsetNumber = 0;
  if ('00209161' in metadata) {
    frameOffsetNumber = Number(metadata['00209228']['Value'][0]);
  }
  /*
   * The values "TILED_SPARSE" and "TILED_FULL" were introduced in the 2018
   * of the standard. Older datasets are equivalent to "TILED_SPARSE"
   * even though they may not have a value or a different value.
  */
  try {
    var dimensionOrganizationType = metadata['00209311']['Value'][0];
  } catch (error) {
    var dimensionOrganizationType = 'TILED_SPARSE';
  }
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
    const perFrameFunctionalGroupsSequence = metadata['52009230']['Value'];
    for (let j = 0; j < numberOfFrames; j++) {
      let planePositionSlideSequence = perFrameFunctionalGroupsSequence[j]['0048021A']['Value'][0];
      let rowPositionInTotalPixelMatrix = planePositionSlideSequence['0048021F']['Value'][0];
      let columnPositionInTotalPixelMatrix = planePositionSlideSequence['0048021E']['Value'][0];
      let rowIndex = Math.ceil(rowPositionInTotalPixelMatrix / columns);
      let colIndex = Math.ceil(columnPositionInTotalPixelMatrix / rows);
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
  if ( imageType[2] !== 'VOLUME' ) {
    throw new Error(
      'expected image type value 3 to be "VOLUME", is "' + imageType[2] + '" instead'
    );
  }

  const loadJSONDataset = (elements) => {
    const dataset = {};
    Object.keys(elements).forEach(tag => {
      const keyword = tagToKeyword[tag];
      const vr = elements[tag]['vr'];
      if ('BulkDataURI' in elements[tag]) {
        console.log(`skip bulk data element "${keyword}"`)
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
          dataset[keyword] = "";  // TODO: should rather be null?
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

// Combine concatenation parts
const concatenate = (datasets) => {

  // let sopInstanceUID = metadata['00080018']['Value'][0];
  // if ('00209161' in metadata) {
  //   sopInstanceUID = metadata['00209161']['Value'][0];
  // }

};


export { formatImageMetadata, getFrameMapping };
