import { VLWholeSlideMicroscopyImage, getFrameMapping } from './metadata.js';
import { RenderingEngine } from './renderingEngine.js';
import {
    arraysEqual,
  } from './utils.js';
import TileImage from 'ol/source/TileImage';
import TileLayer from 'ol/layer/Tile';

/** Extracts value of Pixel Spacing attribute from metadata.
 *
 * @param {object} metadata - Metadata of a DICOM VL Whole Slide Microscopy Image instance
 * @returns {number[]} Spacing between pixel columns and rows in millimeter
 * @private
 */
 function _getPixelSpacing(metadata) {
    const functionalGroup = metadata.SharedFunctionalGroupsSequence[0];
    const pixelMeasures = functionalGroup.PixelMeasuresSequence[0];
    return pixelMeasures.PixelSpacing;
  }

/** BlendingInformation for DICOM VL Whole Slide Microscopy Image instances
 * with Image Type VOLUME.
 *
 * @class
 * @memberof channel
 */  

class BlendingInformation {
  /*
  * An interface class to set/get the visualization/presentation parameters from a channel object
  * @param {string} opticalPathIdentifier, ID of the channel 
  * @param {number[]}  color
  * @param {number}  opacity
  * @param {number[]}  contrastLimitsRange
  * @param {boolean} visible
  * @param {boolean} addToMap 
  */
  constructor(
    opticalPathIdentifier, 
    color,
    opacity,
    contrastLimitsRange,
    visible,
    addToMap) {

    this.opticalPathIdentifier = opticalPathIdentifier;
    this.color = [...color];
    this.opacity = opacity;
    this.contrastLimitsRange = [...contrastLimitsRange];
    this.visible = visible;
    this.addToMap = addToMap;
    }
}

/** FrameData for a tile image
 *
 * @class
 * @memberof channel
 */  

 class FrameData {

  constructor(
    pixelData, 
    bitsAllocated,
    contrastLimitsRange,
    color,
    opacity,
    columns,
    rows) {

    this.pixelData = pixelData;
    this.bitsAllocated = [...bitsAllocated];
    this.contrastLimitsRange = [...contrastLimitsRange];
    this.color = [...color];
    this.opacity = opacity;
    this.columns = columns;
    this.rows = rows;
    }
}

/** Channel for DICOM VL Whole Slide Microscopy Image instances
 * with Image Type VOLUME.
 *
 * @class
 * @memberof channel
 */

class Channel {
/**
 * Create a channel instances which contains all the visualization/presnetation parameters and OpenLayer objects for a Whole Slide Microscopy Image.
 *
 * @param {object} BlendingInformation
 * 
 * TO DO: implement API to select focal plane in the case of 3D channels (channels with a bandwith)
 * TO DO: use DICOM attributes for loading/saving the channel parameters (i.e. load/save the presentation state/BlendingInformation in DICOM), for example:
 *        [x] Select area for display: http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.10.4.html 
 *        [x] Clipping pixel values: http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.11.33.html#table_C.11.33.1-1 
 *        [x] Select channels for display and specify the color of each channel: http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.11.34.html
 *        [x] Blending of images: http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.11.34.html http://dicom.nema.org/medical/dicom/current/output/chtml/part04/sect_N.2.6.html
 * TO DO: for coloring monochrome channels we download the uncompressed binaries data. 
 *        For a large N of channels, this could be a substantial bottleneck. 
 *        Check performance downloading binary (octet-stream) vs downloading compressed (png/jpeg) + decoding. 
 *        https://github.com/cornerstonejs/codecs 
 * NOTE: channel coloring is allowed only for monochorme channels (i.e SamplesPerPixel === 1).
 */
  constructor(blendingInformation) {
    this.blendingInformation = blendingInformation;
    this.metadata = [];
    this.rasterSource = null;
    this.tileLayer = null;
  }

  /** Initializes the channel building the OpenLayer objects. 
   * All the channel have to share the same geometry properties.
   * 
   * @param {number[]} reference Origins array
   * @param {number[]} reference Resolutions array
   * @param {number[]} reference GridSizes array
   * @param {number[]} reference TileSizes array
   * @param {number[]} reference PixelSpacings array
   * @param {object} OpenLayer projection
   * @param {object} OpenLayer tileGrid
   * @param {object} VolumeImageViewer options
   * @param {object} VolumeImageViewer offscreen rendering engine
   * 
   * NOTE: in this method we set observations to the OpenLayer events 'prerender' and 'postrender',
   *       for setting the globalCompositeOperation value to 'lighter' during the tiles blending.
   */
  initChannel(referenceExtent, 
    referenceOrigins,
    referenceResolutions,
    referenceGridSizes,
    referenceTileSizes,
    referencePixelSpacings,
    projection,
    tileGrid,
    options,
    renderingEngine) {
    /*
    * To visualize images accross multiple scales, we first need to
    * determine the image pyramid structure, i.e. the size and resolution
    * images at the different pyramid levels.
    */
    
    let geometryArrays = Channel.deriveChannelGeometry(this);
    
    // Check that all the channels have the same pyramid parameters
    if (arraysEqual(geometryArrays[0], referenceExtent) === false) {
      throw new Error(
        'Channels have different extent'
      );
    }
    if (arraysEqual(geometryArrays[1], referenceOrigins) === false) {
      throw new Error(
        'Channels have different origins'
      );
    }
    if (arraysEqual(geometryArrays[2], referenceResolutions) === false) {
      throw new Error(
        'Channels have different resolutions'
      );
    }
    if (arraysEqual(geometryArrays[3], referenceGridSizes) === false) {
      throw new Error(
        'Channels have different grid sizes'
      );
    }
    if (arraysEqual(geometryArrays[4], referenceTileSizes) === false) {
      throw new Error(
        'Channels have different tile sizes'
      );
    }
    if (arraysEqual(geometryArrays[5], referencePixelSpacings) === false) {
      throw new Error(
        'Channels have different pixel spacings'
      );
    }
    
    /*
     * Define custom tile URL function to retrive frames via DICOMweb WADO-RS.
     */
    const tileUrlFunction = (tileCoord, pixelRatio, projection) => {
      /*
       * Variables x and y correspond to the X and Y axes of the slide
       * coordinate system. Since we want to view the slide horizontally
       * with the label on the right side, the x axis of the slide
       * coordinate system is the vertical axis of the viewport and the
       * y axis of the slide coordinate system the horizontal axis of the
       * viewport. Note that this is in contrast to the nomenclature used
       * by Openlayers.
       */
    
      const z = tileCoord[0];
      const y = tileCoord[1] + 1;
      const x = tileCoord[2] + 1;
      const index = x + "-" + y;
    
      const path = this.pyramidFrameMappings[z][index];
      if (path === undefined) {
        console.warn("tile " + index + " not found at level " + z);
        return (null);
      }
      let url = options.client.wadoURL +
        "/studies/" + this.pyramidMetadata[z].StudyInstanceUID +
        "/series/" + this.pyramidMetadata[z].SeriesInstanceUID +
        '/instances/' + path;
      if (options.retrieveRendered) {
        url = url + '/rendered';
      }
      return (url);
    }
    /*
     * Define custom tile loader function, which is required because the
     * WADO-RS response message has content type "multipart/related".
    */
    const tileLoadFunction = async (tile, src) => {
      const img = tile.getImage();
    
      const z = tile.tileCoord[0];
      const columns = this.pyramidMetadata[z].Columns;
      const rows = this.pyramidMetadata[z].Rows;
      const samplesPerPixel = this.pyramidMetadata[z].SamplesPerPixel; // number of colors for pixel
      const bitsAllocated = this.pyramidMetadata[z].BitsAllocated; // memory for pixel
      const pixelRepresentation = this.pyramidMetadata[z].PixelRepresentation; // 0 unsigned, 1 signed
    
      const { contrastLimitsRange, color, opacity } = this.blendingInformation;
    
      if (src !== null) {
        const studyInstanceUID = DICOMwebClient.utils.getStudyInstanceUIDFromUri(src);
        const seriesInstanceUID = DICOMwebClient.utils.getSeriesInstanceUIDFromUri(src);
        const sopInstanceUID = DICOMwebClient.utils.getSOPInstanceUIDFromUri(src);
        const frameNumbers = DICOMwebClient.utils.getFrameNumbersFromUri(src);
      
        if (options.retrieveRendered) {
          // Figure out from the metadata if this is a color image dataset
          // if it is, use png mediatype and png transfer syntax to just get pngs
          // Otherwise, get the data as an octet-stream and use that
          // TO DO: should we get always png and decompress for monochorme channels (i.e. samplesPerPixel === 1)?
          // https://github.com/cornerstonejs/codecs
    
          let mediaType = 'application/octet-stream';
          let transferSyntaxUID = '1.2.840.10008.1.2.1';
          if (samplesPerPixel !== 1) {
            mediaType = 'image/png';
            transferSyntaxUID = '';
          }
          const retrieveOptions = {
            studyInstanceUID,
            seriesInstanceUID,
            sopInstanceUID,
            frameNumbers,
            mediaTypes: [
              { mediaType, transferSyntaxUID }
            ]
          };
          if (options.includeIccProfile) {
            retrieveOptions['queryParams'] = {
              iccprofile: 'yes'
            }
          }
          if (samplesPerPixel === 1) {
            options.client.retrieveInstanceFrames(retrieveOptions).then(
              (rawFrames) => {
                let pixelData;
                switch (bitsAllocated) {
                  case 8:
                    if (pixelRepresentation === 1) {
                      pixelData = new Int8Array(rawFrames[0])
                    } else {
                      pixelData = new Uint8Array(rawFrames[0])
                    }
                    break;
                  case 16:
                    if (pixelRepresentation === 1) {
                      pixelData = new Int16Array(rawFrames[0])
                    } else {
                      pixelData = new Uint16Array(rawFrames[0])
                    }
                    break;
                  default:
                    throw new Error(
                      'bit not supported'
                    );
                }
                const frameData = {
                  pixelData,
                  bitsAllocated,
                  contrastLimitsRange,
                  color,
                  opacity,
                  columns,
                  rows
                }; 
                img.src = renderingEngine.colorImageFrame(frameData, 'image/jpeg', options.blendingImageQuality);
              }
            );
          } else {
            options.client.retrieveInstanceFramesRendered(retrieveOptions).then(
              (renderedFrame) => {
                const blob = new Blob([renderedFrame], {type: mediaType});
                img.src = window.URL.createObjectURL(blob);
              }
            );
          }
        } else {
          // TODO: support "image/jp2" and "image/jls"
    
          // Figure out from the metadata if this is a color image dataset
          // if it is, use jpeg mediatype and jpeg transfer syntax to just get jpegs
          // Otherwise, get the data as an octet-stream and use that
          // TO DO: should we get always jpeg and decompress for monochorme channels (i.e. samplesPerPixel === 1)?
          // https://github.com/cornerstonejs/codecs
          let mediaType = 'application/octet-stream';
          let transferSyntaxUID = '1.2.840.10008.1.2.1';
          if (samplesPerPixel !== 1) {
            mediaType = 'image/jpeg';
            transferSyntaxUID = '1.2.840.10008.1.2.4.50';
          }
          const retrieveOptions = {
            studyInstanceUID,
            seriesInstanceUID,
            sopInstanceUID,
            frameNumbers,
            mediaTypes: [
              { mediaType, transferSyntaxUID }
            ]
          };
          options.client.retrieveInstanceFrames(retrieveOptions).then(
            (rawFrames) => {
              if (samplesPerPixel === 1) {
                let pixelData;
                switch (bitsAllocated) {
                  case 8:
                    if (pixelRepresentation === 1) {
                      pixelData = new Int8Array(rawFrames[0])
                    } else {
                      pixelData = new Uint8Array(rawFrames[0])
                    }
                    break;
                  case 16:
                    if (pixelRepresentation === 1) {
                      pixelData = new Int16Array(rawFrames[0])
                    } else {
                      pixelData = new Uint16Array(rawFrames[0])
                    }
                    break;
                  default:
                    throw new Error(
                      'bit not supported'
                    );
                }
                const frameData = {
                  pixelData,
                  bitsAllocated,
                  contrastLimitsRange,
                  color,
                  opacity,
                  columns,
                  rows
                }; 
                img.src = renderingEngine.colorImageFrame(frameData, 'image/jpeg', options.blendingImageQuality);
              } else {
                const blob = new Blob(rawFrames, {type: mediaType});
                img.src = window.URL.createObjectURL(blob);
              }
            }
          );
        }
      } else {
        console.warn('could not load tile');
      }
    }
    
    /*
     * We use the existing TileImage source but customize it to retrieve
     * frames (load tiles) via DICOMweb WADO-RS.
    */
    this.rasterSource = new TileImage({
      crossOrigin: 'Anonymous',
      tileGrid: tileGrid,
      projection: projection,
      wrapX: false
    });
    
    this.rasterSource.setTileUrlFunction(tileUrlFunction);
    this.rasterSource.setTileLoadFunction(tileLoadFunction);
    
    // Create OpenLayer renderer object
    this.tileLayer = new TileLayer({
      extent: tileGrid.getExtent(),
      source: this.rasterSource,
      preload: 0,
      projection: projection
    });
    
    this.tileLayer.setVisible(this.blendingInformation.visible);
    
    // Set the composition type for the OpenLayer renderer object
    this.tileLayer.on('prerender', function (event) {
      event.context.globalCompositeOperation = 'lighter';
    });
    
    this.tileLayer.on('postrender', function (event) {
      event.context.globalCompositeOperation = 'source-over';
    });
  }

  /** Returns the Extents, Origins, Resolutions, GridSizes, TileSizes, PixelSpacings array of the channel.
   * 
   * @param {object} channel
   * @returns {number[][]} Extents, Origins, Resolutions, GridSizes, TileSizes, PixelSpacings array
   * @static
   */
  static deriveChannelGeometry(channel) {
    channel.microscopyImages = [];
    channel.metadata.forEach(m => {
      const image = new VLWholeSlideMicroscopyImage({ metadata: m });
      if (image.ImageType[2] === 'VOLUME') {
        channel.microscopyImages.push(image);
      }
    });
    if (channel.microscopyImages.length === 0) {
      throw new Error('No VOLUME image provided.')
    }
    // Sort instances and optionally concatenation parts if present.
    channel.microscopyImages.sort((a, b) => {
      const sizeDiff = a.TotalPixelMatrixColumns - b.TotalPixelMatrixColumns;
      if (sizeDiff === 0) {
        if (a.ConcatenationFrameOffsetNumber !== undefined) {
          return a.ConcatenationFrameOffsetNumber - b.ConcatenationFrameOffsetNumber;
        }
        return sizeDiff;
      }
      return sizeDiff;
    });
    
    channel.pyramidMetadata = [];
    channel.pyramidFrameMappings = [];
    let frameMappings = channel.microscopyImages.map(m => getFrameMapping(m));
    for (let i = 0; i < channel.microscopyImages.length; i++) {
      const cols = channel.microscopyImages[i].TotalPixelMatrixColumns;
      const rows = channel.microscopyImages[i].TotalPixelMatrixRows;
      const numberOfFrames = channel.microscopyImages[i].NumberOfFrames;
      /*
       * Instances may be broken down into multiple concatentation parts.
       * Therefore, we have to re-assemble instance metadata.
      */
      let alreadyExists = false;
      let index = null;
      for (let j = 0; j < channel.pyramidMetadata.length; j++) {
        if (
          (channel.pyramidMetadata[j].TotalPixelMatrixColumns === cols) &&
          (channel.pyramidMetadata[j].TotalPixelMatrixRows === rows)
        ) {
          alreadyExists = true;
          index = j;
        }
      }
      if (alreadyExists) {
        // Update with information obtained from current concatentation part.
        Object.assign(channel.pyramidFrameMappings[index], frameMappings[i]);
        channel.pyramidMetadata[index].NumberOfFrames += numberOfFrames;
        if ("PerFrameFunctionalGroupsSequence" in channel.microscopyImages[index]) {
            channel.pyramidMetadata[index].PerFrameFunctionalGroupsSequence.push(
            ...channel.microscopyImages[i].PerFrameFunctionalGroupsSequence
          );
        }
        if (!"SOPInstanceUIDOfConcatenationSource" in channel.microscopyImages[i]) {
          throw new Error(
            'Attribute "SOPInstanceUIDOfConcatenationSource" is required ' +
            'for concatenation parts.'
          );
        }
        const sopInstanceUID = channel.microscopyImages[i].SOPInstanceUIDOfConcatenationSource;
        channel.pyramidMetadata[index].SOPInstanceUID = sopInstanceUID;
        delete channel.pyramidMetadata[index].SOPInstanceUIDOfConcatenationSource;
        delete channel.pyramidMetadata[index].ConcatenationUID;
        delete channel.pyramidMetadata[index].InConcatenationNumber;
        delete channel.pyramidMetadata[index].ConcatenationFrameOffsetNumber;
      } else {
        channel.pyramidMetadata.push(channel.microscopyImages[i]);
        channel.pyramidFrameMappings.push(frameMappings[i]);
      }
    }
    const nLevels = channel.pyramidMetadata.length;
    if (nLevels === 0) {
      console.error('empty pyramid - no levels found')
    }
    channel.pyramidBaseMetadata = channel.pyramidMetadata[nLevels - 1];
    
    /*
     * Collect relevant information from DICOM metadata for each pyramid
     * level to construct the Openlayers map.
    */
    const channelTileSizes = [];
    const channelGridSizes = [];
    const channelResolutions = [];
    const channelOrigins = [];
    const channelPixelSpacings = [];
    const offset = [0, -1];
    const basePixelSpacing = _getPixelSpacing(channel.pyramidBaseMetadata);
    const baseTotalPixelMatrixColumns = channel.pyramidBaseMetadata.TotalPixelMatrixColumns;
    const baseTotalPixelMatrixRows = channel.pyramidBaseMetadata.TotalPixelMatrixRows;
    const baseColumns = channel.pyramidBaseMetadata.Columns;
    const baseRows = channel.pyramidBaseMetadata.Rows;
    const baseNColumns = Math.ceil(baseTotalPixelMatrixColumns / baseColumns);
    const baseNRows = Math.ceil(baseTotalPixelMatrixRows / baseRows);
    for (let j = (nLevels - 1); j >= 0; j--) {
      const columns = channel.pyramidMetadata[j].Columns;
      const rows = channel.pyramidMetadata[j].Rows;
      const totalPixelMatrixColumns = channel.pyramidMetadata[j].TotalPixelMatrixColumns;
      const totalPixelMatrixRows = channel.pyramidMetadata[j].TotalPixelMatrixRows;
      const pixelSpacing = _getPixelSpacing(channel.pyramidMetadata[j]);
      const nColumns = Math.ceil(totalPixelMatrixColumns / columns);
      const nRows = Math.ceil(totalPixelMatrixRows / rows);
      channelTileSizes.push([
        columns,
        rows,
      ]);
      channelGridSizes.push([
        nColumns,
        nRows,
      ]);
      channelPixelSpacings.push(pixelSpacing);
     /*
      * Compute the resolution at each pyramid level, since the zoom
      * factor may not be the same between adjacent pyramid levels.
      */
      let zoomFactor = baseTotalPixelMatrixColumns / totalPixelMatrixColumns;
      channelResolutions.push(zoomFactor);
     /*
      * TODO: One may have to adjust the offset slightly due to the
      * difference between extent of the image at a given resolution level
      * and the actual number of tiles (frames).
      */
     channelOrigins.push(offset);
    }
    channelResolutions.reverse();
    channelTileSizes.reverse();
    channelGridSizes.reverse();
    channelOrigins.reverse();
    channelPixelSpacings.reverse();

    /** Frames may extend beyond the size of the total pixel matrix.
     * The excess pixels are empty, i.e. have only a padding value.
     * We set the extent to the size of the actual image without taken
     * excess pixels into account.
     * Note that the vertical axis is flipped in the used tile source,
     * i.e. values on the axis lie in the range [-n, -1], where n is the
     * number of rows in the total pixel matrix.
     */

    const channelExtents = [
        0,                                // min X
        -(baseTotalPixelMatrixRows + 1),  // min Y
        baseTotalPixelMatrixColumns,      // max X
        -1                                // max Y
      ];

    return [
      channelExtents,  
      channelOrigins,
      channelResolutions,
      channelGridSizes,
      channelTileSizes,
      channelPixelSpacings
    ];
  }

  /** Adds the metadata to the metadata array of the channel
   * @param {object} metadata
   */
  addMetadata(metadata){
    this.metadata.push(metadata);
  }

  /** Gets the channel visualization/presentation parameters
   * @returns {object} BlendingInformation
   */
  getPresentationState() {
    return this.blendingInformation;
  }

  /** Sets the channel visualization/presentation parameters
   * @param {number[]} color
   * @param {number} opacity
   * @param {number[]} contrastLimitsRange
   * @param {boolean} visible
   */
  setPresentationState(
    color,
    opacity,
    contrastLimitsRange,
    visible) {
    
    if (color) {
      this.blendingInformation.color = [...color];
    }
    if (opacity) {
      this.blendingInformation.opacity = opacity;
    }
    if (contrastLimitsRange) {
      this.blendingInformation.contrastLimitsRange = [...contrastLimitsRange];
    }
    if (visible) {
      this.blendingInformation.visible = visible;
      this.tileLayer.setVisible(this.blendingInformation.visible);
    }

    // need to rerun offscren render to color the layers already loaded
    this.rasterSource.refresh()
    // TO DO: this will redonwload the tiles, we should just recolor all the tiles already cached
  }
}

export { Channel, BlendingInformation };
