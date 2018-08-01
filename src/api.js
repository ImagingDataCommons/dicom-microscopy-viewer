import WebGLMap from 'ol/WebGLMap';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import TileGrid from 'ol/tilegrid/TileGrid';
import Projection from 'ol/proj/Projection';
import OverviewMap from 'ol/control/OverviewMap';
import Zoom from 'ol/control/Zoom';
import ZoomSlider from 'ol/control/ZoomSlider';
import FullScreen from 'ol/control/FullScreen';
import ScaleLine from 'ol/control/ScaleLine';

import { getCenter } from 'ol/extent.js';

import { formatImageMetadata } from './metadata.js';


class DICOMMicroscopyViewer {

  /*
   * options:
   * client - an instance of DICOMwebClient
   * studyInstanceUID - DICOM Study Instance UID
   * seriesInstanceUID - DICOM Study Instance UID
   */
  constructor(options) {
    this.client = options.client;
    this.studyInstanceUID = options.studyInstanceUID;
    this.seriesInstanceUID = options.seriesInstanceUID;
    this.map = null;
  }

  /*
   * options:
   * container - name of an HTML document element
   */
  render(options) {
    console.log('render images using microscopy viewer')
    const studyInstanceUID = this.studyInstanceUID;
    const seriesInstanceUID = this.seriesInstanceUID;
    if (!('container' in options)) {
      console.error('container is required to render images')
    }

    // Search for all instances that are part of the series.
    const searchInstanceOptions = {
      studyInstanceUID,
      seriesInstanceUID
    };
    // TODO: We may want to filter instances based on image type or modality.
    const metadataPromise = client.searchForInstances(searchInstanceOptions).then((instances) => {

      /*
       * To visualize images accross multiple scales, we first need to
       * determine the image pyramid structure, i.e. the size and resolution
       * images at the different pyramid levels.
       * To this end, we retrieve the metadata for each instance.
      */
      const promises = []
      for (let i = 0; i < instances.length; i++) {
        const sopInstanceUID = instances[i]["00080018"]["Value"][0];
        const retrieveInstanceOptions = {
          studyInstanceUID,
          seriesInstanceUID,
          sopInstanceUID,
        };
        const promise = client.retrieveInstanceMetadata(retrieveInstanceOptions).then((metadata) => {
          // TODO: Use label and localizer images.
          const imageType = metadata[0]["00080008"]["Value"];
          if ( imageType[2] !== "VOLUME") {
            return(null);
          }
          return(formatImageMetadata(metadata[0]));
        });
        promises.push(promise);
      }
      return(Promise.all(promises));
    });

    const mapPromise = metadataPromise.then((metadata) => {
      metadata = metadata.filter(m => m);

      const levels = [];
      for (let i = 0; i < metadata.length; i++) {
        const cols = metadata[i].totalPixelMatrixColumns;
        const rows = metadata[i].totalPixelMatrixRows;
        const paths = metadata[i].paths;
        /*
         * Instances may be broken down into multiple concatentation parts.
         * Therefore, we have to re-assemble instance metadata.
        */
        let alreadyExists = false;
        let index = null;
        for (let j = 0; j < levels.length; j++) {
          if (levels[j].totalPixelMatrixColumns === cols && levels[j].totalPixelMatrixRows === rows) {
            alreadyExists = true;
            index = j;
          }
        }
        if (alreadyExists) {
          /*
           * Update "paths" with information obtained from current
           * concatentation part.
          */
          Object.assign(levels[index].paths, paths);
        } else {
          levels.push(metadata[i]);
        }
      }
      // Sort levels in ascending order
      levels.sort(function(a, b) {
        if(a.totalPixelMatrixColumns < b.totalPixelMatrixColumns) {
          return -1;
        } else if(a.totalPixelMatrixColumns > b.totalPixelMatrixColumns) {
          return 1;
        } else {
          return 0;
        }
      });

      /*
       * Collect relevant information from DICOM metadata for each pyramid
       * level to construct the Openlayers map.
      */
      const tileSizes = [];
      const totalSizes = [];
      const resolutions = [];
      const origins = [[0, -1]];
      for (let j = 0; j < levels.length; j++) {
        let columns = levels[j].columns;
        let rows = levels[j].rows;
        let totalPixelMatrixColumns = levels[j].totalPixelMatrixColumns;
        let totalPixelMatrixRows = levels[j].totalPixelMatrixRows;
        let colFactor = Math.ceil(totalPixelMatrixColumns / columns);
        let rowFactor = Math.ceil(totalPixelMatrixRows / rows);
        tileSizes.push([columns, rows]);
        totalSizes.push([columns * colFactor, rows * rowFactor]);

        /*
         * Compute the resolution at each pyramid level, since the zoom
         * factor may not be the same between adjacent pyramid levels.
        */
        let zoomFactorColumns =  levels[0].totalPixelMatrixColumns / totalPixelMatrixColumns;
        let zoomFactorRows =  levels[0].totalPixelMatrixRows / totalPixelMatrixRows;
        let zoomFactor = (zoomFactorColumns + zoomFactorRows) / 2;
        resolutions.push(zoomFactor);

        /*
         * TODO: One may have to adjust the offset slightly due to the
         * difference between extent of the image at a resolution level
         * and the actual number of tiles (frames).
        */
        let orig = [0, -1]
        if (j < levels.length-1) {
          origins.push(orig)
        }
      }
      totalSizes.reverse();
      tileSizes.reverse();
      origins.reverse();

      /*
        * Translate pixel units of total pixel matrix into millimeters of
        * slide coordinate system
      */
      function coordinateFormatFunction(coordinate) {
        x = (coordinate[0] * levels[levels.length-1].pixelSpacing[0]).toFixed(4);
        y = (-(coordinate[1] - 1) * levels[levels.length-1].pixelSpacing[1]).toFixed(4);
        return([x, y]);
      }

      /*
       * Define custom tile URL function to retrive frames via DICOMweb
       * WADO-RS.
       */
      function tileUrlFunction(tileCoord, pixelRatio, projection) {
        /*
         * Variables x and y correspond to the X and Y axes of the slide
         * coordinate system. Since we want to view the slide horizontally
         * with the label on the right side, the x axis of the slide
         * coordinate system is the vertical axis of the viewport and the
         * y axis of the slide coordinate system the horizontal axis of the
         * viewport. Note that this is in contrast to the nomenclature used
         * by Openlayers.
         */
        let z = tileCoord[0];
        let y = tileCoord[1] + 1;
        /*
         * The vertical axis is inverted for the chosen tile source, i.e.
         * it starts at -1 at the top left corner and descreases along the
         * vertical axis to the lower left corner of the viewport.
         */
        let x = -(tileCoord[2] + 1) + 1;
        let index = x + "-" + y;
        let frameNumber = levels[z].frameMapping[index];
        if (frameNumber === undefined) {
          console.warn("tile " + index + " not found at level " + z);
          return(null);
        }
        let url = client.baseUrl +
          "/studies/" + studyInstanceUID +
          "/series/" + seriesInstanceUID +
          '/instances/' + levels[z].sopInstanceUID +
          '/frames/' + frameNumber;
        return(url);
      }

      /*
       * Define custonm tile loader function, which is required because the
       * WADO-RS response message has content type "multipart/related".
      */
      const transferSyntaxUIDToMimeSubType = {
          '1.2.840.10008.1.2.4.50': 'jpeg',
          '1.2.840.10008.1.2.4.80': 'x-jls',
          '1.2.840.10008.1.2.4.90': 'jp2'
      }
      function tileLoadFunction(tile, src) {
        if (src !== null) {
          let studyInstanceUID = DICOMwebClient.utils.getStudyInstanceUIDFromUri(src);
          let seriesInstanceUID = DICOMwebClient.utils.getSeriesInstanceUIDFromUri(src);
          let sopInstanceUID = DICOMwebClient.utils.getSOPInstanceUIDFromUri(src);
          let frameNumbers = DICOMwebClient.utils.getFrameNumbersFromUri(src);
          // FIXME: Determine transfer syntax and map to mime subtype
          // FIXME: Determine zoom level from "tile"
          let transferSyntaxUID = '1.2.840.10008.1.2.4.50';
          let imageSubtype = transferSyntaxUIDToMimeSubType[transferSyntaxUID];
          let retrieveOptions = {
            studyInstanceUID,
            seriesInstanceUID,
            sopInstanceUID,
            frameNumbers,
            imageSubtype
          };
          client.retrieveInstanceFrames(retrieveOptions).then((frames) => {
            let pixels = frames[0];
            // Encode pixel data as base64 string
            const encodedPixels = btoa(String.fromCharCode(...new Uint8Array(pixels)));
            // Add pixel data to image
            tile.getImage().src = "data:image/" + imageSubtype + ";base64," + encodedPixels;

            // console.log('DRAW IMAGE ON CANVAS')
            // const canvas = document.createElement('canvas');
            // canvas.width = 512;
            // canvas.height = 512;
            // const ctx = canvas.getContext('2d');
            // ctx.strokeStyle = 'black';
            // ctx.strokeRect(0.5, 0.5, 512 + 0.5, 512 + 0.5);
            // tile.image_ = ctx.canvas;
            // console.log(tile.getImage());

          });
        } else {
          console.warn('could not load tile');
        }
      }

      /*
       * Frames may extend beyond the size of the total pixel matrix.
       * The excess pixels are empty, i.e. have only a padding value.
       * We set the extent to the size of the actual image without taken
       * excess pixels into account.
       * Note that the vertical axis is flipped in the used tile source,
       * i.e. values on the axis lie in the range [-n, -1], where n is the
       * number of rows in the total pixel matrix.
      */
      const extent = [
        0,                                  // min X
        -levels[0].totalPixelMatrixRows,    // min Y
        levels[0].totalPixelMatrixColumns,  // max X
        -1                                  // max Y
      ];

      /*
       * Determine whether image needs to be rotated relative to slide
       * coordinate system based on direction cosines.
       * There are only planar rotations, since the total pixel matrix is
       * parallel to the slide surface. Here, we further assume that rows and
       * columns of total pixel matrix are parallel to the borders of the slide,
       * i.e. the x and y axis of the slide coordinate system.
       * Hence, we only account for the case where the image may be rotated by
       * 180 degrees.
      */
      var degrees = 0;
      if (
        (levels[levels.length-1].imageOrientationSlide[1] === -1) &&
        (levels[levels.length-1].imageOrientationSlide[3] === -1)
      ) {
        /*
         * The row direction (left to right) of the total pixel matrix
         * is defined by the first three values.
         * The three values specify how the direction changes from the last pixel
         * to the first pixel in the row along each of the three axes of the
         * slide coordinate system (x, y, z), i.e. it express in which direction one
         * is moving in the slide coordinate system when the COLUMN index changes.
         * The column direction (top to bottom) of the total pixel matrix
         * is defined by the first three values.
         * The three values specify how the direction changes from the last pixel
         * to the first pixel in the column along each of the three axes of the
         * slide coordinate system (x, y, z), i.e. it express in which direction one
         * is moving in the slide coordinate system when the ROW index changes.
        */
        degrees = 180;
      }
      const rotation = degrees * (Math.PI / 180);

      /*
       * Specify projection to prevent default automatic projection
       * with the default Mercator projection.
       */
      const projection = new Projection({
        code: "NONE",
        units: 'm',
        extent: extent,
        getPointResolution: function(pixelRes, point) {
          /*
           * DICOM pixel spacing has millimeter unit while the projection has
           * has meter unit.
           */
          let spacing = levels[0].pixelSpacing[1] / 10**3;
          let metricRes = pixelRes * spacing;
          return(metricRes);
        }
      });
      /*
       * TODO: register custom projection:
       *  - http://openlayers.org/en/latest/apidoc/ol.proj.html
       *  - http://openlayers.org/en/latest/apidoc/module-ol_proj.html#~ProjectionLike
       * TODO: Direction cosines could be handled via projection rather
       * than specifying a rotation
       */

      /*
       * We need to specify the tile grid, since DICOM allows tiles to
       * have different sizes at each resolution level and a different zoom
       * factor between individual levels.
       */
      const tileGrid = new TileGrid({
        extent: extent,
        origins: origins,
        resolutions: resolutions,
        sizes: totalSizes,
        tileSizes: tileSizes
      });

      /*
       * We use the implemented XYZ tile source but customize it to retrieve
       * frames (load tiles) via DICOMweb WADO-RS.
       */
      const source = new XYZ({
        crossOrigin: "Anonymous",
        tileGrid: tileGrid,
        projection: projection
      });
      source.setTileUrlFunction(tileUrlFunction);
      source.setTileLoadFunction(tileLoadFunction);

      const layer = new TileLayer({
        extent: extent,
        source: source,
        preload: 2,
        projection: projection
      });

      const view = new View({
        center: getCenter(extent),
        extent: extent,
        projection: projection,
        resolutions: resolutions,
        rotation: rotation
      });

      const overviewView = new View({
        projection: projection,
        resolutions: resolutions,
        rotation: rotation
      });

      /*
       * Creates the map with the defined layers and view and renders it via
       * WebGL.
       */
      this.map = new WebGLMap({
        layers: [layer],
        view: view,
        target: options.container,
        // TODO: allow configuration (styling) of controls
        controls: [
          new OverviewMap({
            view: overviewView,
            collapsed: true
          }),
          new Zoom(),
          new ZoomSlider(),
          new FullScreen(),
          new ScaleLine({units: 'metric'})
        ],
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        logo: false
      });
      this.map.getView().fit(extent);
      return(this.map);
    });
    return(mapPromise);
  }

}

export { DICOMMicroscopyViewer };
