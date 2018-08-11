
function formatImageMetadata(metadata) {

  const sopClassUID = metadata['00080016']['Value'][0];
  if (sopClassUID !== '1.2.840.10008.5.1.4.1.1.77.1.6') {
    console.error('SOP Class UID "' + sopClassUID + '" is not supported')
  }

  const imageType = metadata['00080008']['Value'];
  if ( imageType[2] !== 'VOLUME' ) {
    console.error('expected image type value 3 to be "VOLUME", is "' + imageType[2] + '" instead')
  }

  const studyInstanceUID = metadata['0020000D']['Value'][0];
  const seriesInstanceUID = metadata['0020000E']['Value'][0];
  const rows = metadata['00280010']['Value'][0];
  const columns = metadata['00280011']['Value'][0];
  const totalPixelMatrixColumns = metadata['00480006']['Value'][0];
  const totalPixelMatrixRows = metadata['00480007']['Value'][0];
  const imageVolumeHeight = metadata['00480002']['Value'][0];
  const imageVolumeWidth = metadata['00480001']['Value'][0];
  const sharedFunctionalGroupsSequence = metadata['52009229']['Value'][0];
  const pixelMeasuresSequence = sharedFunctionalGroupsSequence['00289110']['Value'][0];
  const pixelSpacing = pixelMeasuresSequence['00280030']['Value'];
  const numberOfFrames = Number(metadata['00280008']['Value'][0]);

  /*
   * The values "TILED_SPARSE" and "TILED_FULL" were introduced in the 2018
   * of the standard. Older datasets are equivalent to "TILED_SPARSE"
   * even though they may not have a value or a different value.
  */
  try {
    var dimensionOrganizationType = metadata['00209311']['Value'][0];
  } catch (err) {
    var dimensionOrganizationType = 'TILED_SPARSE';
  }

  const imageOrientationSlide = metadata['00480102']['Value'];

  let tilesPerRow = Math.ceil(totalPixelMatrixColumns / columns);
  let tilesPerColumn = Math.ceil(totalPixelMatrixRows / rows);
  const frameMapping = {};
  // We may update the SOPInstanceUID when reassembling concatentations
  let sopInstanceUID = metadata['00080018']['Value'][0];
  let sopInstanceUIDOfConcatenationSource = null;
  let frameOffsetNumber = 0;
  if ('00209161' in metadata) {
      sopInstanceUIDOfConcatenationSource = metadata['00209161']['Value'][0];
      frameOffsetNumber = Number(metadata['00209228']['Value'][0]);
  }
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

  if (sopInstanceUIDOfConcatenationSource) {
    sopInstanceUID = sopInstanceUIDOfConcatenationSource;
  }

  return({
    studyInstanceUID,
    seriesInstanceUID,
    sopInstanceUID,
    rows,
    columns,
    totalPixelMatrixColumns,
    totalPixelMatrixRows,
    imageVolumeWidth,
    imageVolumeHeight,
    pixelSpacing,
    imageOrientationSlide,
    frameMapping
  });
}

export { formatImageMetadata };
