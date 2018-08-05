import WebGLMap from 'ol/WebGLMap';
import Map from 'ol/Map';
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
import Draw, {createRegularPolygon, createBox} from 'ol/interaction/Draw';
import Select from 'ol/interaction/Select';
import Modify from 'ol/interaction/Modify';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Collection from 'ol/Collection';

import { getCenter } from 'ol/extent';
import { toStringXY } from 'ol/coordinate';

import { formatImageMetadata } from './metadata.js';

import DICOMwebClient from 'dicomweb-client/build/dicomweb-client.js'


const map = Symbol();
const annotations = Symbol();
const graphics = Symbol();
const segmentations = Symbol();
const pyramid = Symbol();
const client = Symbol();
const controls = Symbol();
const interactions = Symbol();


// TODO: abastraction of Openlayers "Feature"
class Annotation {

}

class DICOMMicroscopyViewer {

  /*
   * options:
   *   - client (instance of DICOMwebClient)
   *   - metadata (array of DICOM JSON metadata for each image instance)
   *   - onClickHandler (on-event handler function)
   *   - onSingleClickHandler (on-event handler function)
   *   - onDoubleClickHandler (on-event handler function)
   *   - onDragHandler (on-event handler function)
   *   - onAddAnnotationHandler (on-event handler function)
   *   - onRemoveAnnotationHandler (on-event handler function)
   *   - onAddGraphicHandler (on-event handler function)
   *   - onRemoveGraphicHandler (on-event handler function)
   *   - onChangeGraphicHandler (on-event handler function)
   *   - onClearGraphicsHandler (on-event handler function)
   *
   * ---
   * Map Event (http://openlayers.org/en/latest/apidoc/module-ol_MapBrowserEvent-MapBrowserEvent.html)
   * Properties:
   *   - coordinate (http://openlayers.org/en/latest/apidoc/module-ol_coordinate.html#~Coordinate)
   *   - pixel
   */
  constructor(options) {
    this[client] = options.client;

    // Collection of Openlayers "VectorLayer" instances indexable by
    // DICOM Series Instance UID
    this[segmentations] = {};

    // Collection of Openlayers "Feature" instances
    this[annotations] = new Collection([], {unique: true});

    if (typeof options.onAddAnnotationHandler === 'function') {
      this[annotations].on('add', options.onAddAnnotationHandler);
    }
    if (typeof options.onRemoveAnnotationHandler === 'function') {
      this[annotations].on('add', options.onRemoveAnnotationHandler);
    }

    /*
     * To visualize images accross multiple scales, we first need to
     * determine the image pyramid structure, i.e. the size and resolution
     * images at the different pyramid levels.
    */
    const metadata = options.metadata.map(m => formatImageMetadata(m));
    this[pyramid] = [];
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
      for (let j = 0; j < this[pyramid].length; j++) {
        if (
            (this[pyramid][j].totalPixelMatrixColumns === cols) &&
            (this[pyramid][j].totalPixelMatrixRows === rows)
          ) {
          alreadyExists = true;
          index = j;
        }
      }
      if (alreadyExists) {
        /*
         * Update "paths" with information obtained from current
         * concatentation part.
        */
        Object.assign(this[pyramid][index].paths, paths);
      } else {
        this[pyramid].push(metadata[i]);
      }
    }
    // Sort levels in ascending order
    this[pyramid].sort(function(a, b) {
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
    for (let j = 0; j < this[pyramid].length; j++) {
      let columns = this[pyramid][j].columns;
      let rows = this[pyramid][j].rows;
      let totalPixelMatrixColumns = this[pyramid][j].totalPixelMatrixColumns;
      let totalPixelMatrixRows = this[pyramid][j].totalPixelMatrixRows;
      let colFactor = Math.ceil(totalPixelMatrixColumns / columns);
      let rowFactor = Math.ceil(totalPixelMatrixRows / rows);
      tileSizes.push([columns, rows]);
      totalSizes.push([columns * colFactor, rows * rowFactor]);

      /*
       * Compute the resolution at each pyramid level, since the zoom
       * factor may not be the same between adjacent pyramid levels.
      */
      let zoomFactorColumns =  this[pyramid][0].totalPixelMatrixColumns / totalPixelMatrixColumns;
      let zoomFactorRows =  this[pyramid][0].totalPixelMatrixRows / totalPixelMatrixRows;
      let zoomFactor = (zoomFactorColumns + zoomFactorRows) / 2;
      resolutions.push(zoomFactor);

      /*
       * TODO: One may have to adjust the offset slightly due to the
       * difference between extent of the image at a resolution level
       * and the actual number of tiles (frames).
      */
      let orig = [0, -1]
      if (j < this[pyramid].length-1) {
        origins.push(orig)
      }
    }
    totalSizes.reverse();
    tileSizes.reverse();
    origins.reverse();

    // We can't call "this" inside functions.
    const levels = this[pyramid];

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
      let url = options.client.baseUrl +
        "/studies/" + levels[z].studyInstanceUID +
        "/series/" + levels[z].seriesInstanceUID +
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

    function base64Encode(data){
      const uint8Array = new Uint8Array(data);
      const chunkSize = 0x8000;
      const strArray = [];
      for (let i=0; i < uint8Array.length; i+=chunkSize) {
        let str = String.fromCharCode.apply(
          null, uint8Array.subarray(i, i + chunkSize)
        );
        strArray.push(str);
      }
      return btoa(strArray.join(''));
    }

    function tileLoadFunction(tile, src) {
      if (src !== null) {
        const studyInstanceUID = DICOMwebClient.utils.getStudyInstanceUIDFromUri(src);
        const seriesInstanceUID = DICOMwebClient.utils.getSeriesInstanceUIDFromUri(src);
        const sopInstanceUID = DICOMwebClient.utils.getSOPInstanceUIDFromUri(src);
        const frameNumbers = DICOMwebClient.utils.getFrameNumbersFromUri(src);
        const imageSubtype = 'jpeg';
        const retrieveOptions = {
          studyInstanceUID,
          seriesInstanceUID,
          sopInstanceUID,
          frameNumbers,
          imageSubtype
        };
        options.client.retrieveInstanceFrames(retrieveOptions).then((frames) => {
          // Encode pixel data as base64 string
          const encodedPixels = base64Encode(frames[0]);
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
      (this[pyramid][this[pyramid].length-1].imageOrientationSlide[1] === -1) &&
      (this[pyramid][this[pyramid].length-1].imageOrientationSlide[3] === -1)
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
      units: 'metric',
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
    const rasterSource = new XYZ({
      crossOrigin: "Anonymous",
      tileGrid: tileGrid,
      projection: projection,
      wrapX: false
    });
    rasterSource.setTileUrlFunction(tileUrlFunction);
    rasterSource.setTileLoadFunction(tileLoadFunction);

    const imageLayer = new TileLayer({
      extent: extent,
      source: rasterSource,
      preload: 2,
      projection: projection
    });

    this[graphics] = new VectorSource({
      tileGrid: tileGrid,
      projection: projection,
      wrapX: false
    });

    if (typeof options.onAddGraphicHandler === 'function') {
      this[annotations].on('addfeature', options.onAddGraphicHandler);
    }
    if (typeof options.onRemoveGraphicHandler === 'function') {
      this[annotations].on('removefeature', options.onRemoveGraphicHandler);
    }
    if (typeof options.onChangeGraphicHandler === 'function') {
      this[annotations].on('changefeature', options.onChangeGraphicHandler);
    }
    if (typeof options.onClearGraphicsHandler === 'function') {
      this[annotations].on('clearfeature', options.onClearGraphicsHandler);
    }

    const graphicLayer = new VectorLayer({
      extent: extent,
      source: this[graphics],
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

    // TODO: ol/control/ZoomToExtent for resolution levels (5x, 10x, 20x, ...)
    // FIXME: change "className"
    this[controls] = {
      overview: new OverviewMap({
        view: overviewView,
        collapsed: true,
      }),
      zoom: new Zoom({
      }),
      zoomSlider: new ZoomSlider({
      }),
      fullScreen: new FullScreen({
      }),
      scaleLine: new ScaleLine({
        units: 'metric',
      }),
    };

    /*
     * Creates the map with the defined layers and view and renders it via
     * WebGL.
     */
    this[map] = new WebGLMap({
      layers: [imageLayer, graphicLayer],
      view: view,
      controls: [],
      loadTilesWhileAnimating: true,
      loadTilesWhileInteracting: true,
      logo: false
    });
    for (let control in this[controls]) {
      // options.controls
      // TODO: enable user to select controls and style them
      // TODO: enable users to define "target" containers for controls
      this[map].addControl(this[controls][control]);
    }
    this[map].getView().fit(extent, this[map].getSize());

    if (typeof options.onClickHandler === 'function') {
      this[map].on('click', options.onClickHandler);
    }
    if (typeof options.onSingleClickHandler === 'function') {
      this[map].on('singleclick', options.onSingleClickHandler);
    }
    if (typeof options.onDoubleClickHandler === 'function') {
      this[map].on('dblclick', options.onDoubleClickHandler);
    }
    if (typeof options.onDragHandler === 'function') {
      this[map].on('pointerdrag', options.onDragHandler);
    }

    this[interactions] = {
      draw: undefined,
      select: undefined,
      modify: undefined
    };

  }

  /*
   * options:
   * container - name of an HTML document element
   */
  render(options) {
    if (!('container' in options)) {
      console.error('container must be provided for rendering images')
    }
    this[map].setTarget(options.container);
  }

  /*
   * options:
   *    - geometryType (string)
   *    - onDrawStartHandler (on-event handler function)
   *    - onDrawEndHandler (on-event handler function)
   *
   * ---
   * Draw Event (http://openlayers.org/en/latest/apidoc/module-ol_interaction_Draw-DrawEvent.html)
   * Properties:
   *   - "feature" (http://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html)
   */
  activateDrawInteraction(options) {
    this.deactivateDrawInteraction();
    /*
     * DICOM graphic types:
     *   POINT: (column, row) pair
     *   MULTIPOINT: set of (column, row) pairs
     *   POLYLINE: ordered series of (column, row) pairs
     *      -> polygon if closed
     *   CIRCLE: two (column, row) pairs
     *      -> first at center and second on perimeter
     *   ELLIPSE: four (column, row) pairs
     *      -> first two at major axes endpoints, second two at minor axes endpoints
     */
    // TODO: "type", "condition", etc.
    const customOptionsMapping = {
      point: {
        type: 'Point',
      },
      line: {
        type: 'LineString',
      },
      freehandLine: {
        type: 'LineString',
        freehand: true,
      },
      circle: {
        type: 'Circle',
      },
      box: {
        type: 'Circle',
        geometryFunction: createRegularPolygon(4),
      },
      polygon: {
        type: 'Polygon',
      },
      freehandPolygon: {
        type: 'Polygon',
        freehand: true,
      }
    };
    const defaultOptions = {
      source: this[graphics],
      features: this[annotations],
    };
    if (!('geometryType' in options)) {
      console.error('geometry type must be specified for drawing interaction')
    }
    if (!(options.geometryType in customOptionsMapping)) {
      console.error(`unsupported geometry type "${options.geometryType}"`)
    }
    const customOptions = customOptionsMapping[options.geometryType];
    const allOptions = Object.assign(defaultOptions, customOptions);
    this[interactions].draw = new Draw(allOptions);

    if (typeof options.onDrawStartHandler === 'function') {
      this[interactions].draw.on('drawstart', options.onDrawStartHandler);
    }
    if (typeof options.onDrawEndHandler === 'function') {
      this[interactions].draw.on('drawend', options.onDrawEndHandler);
    }

    this[map].addInteraction(this[interactions].draw);
  }

  deactivateDrawInteraction() {
    if (this[interactions].draw !== undefined) {
      this[map].removeInteraction(this[interactions].draw);
    }
  }

  /*
   * options:
   *   - onSelectedHandler (on-event handler function)
   *   - onDeselectedHandler (on-event handler function)
   *
   * ---
   * Select Event (http://openlayers.org/en/latest/apidoc/module-ol_interaction_Select-SelectEvent.html)
   * Properties:
   *   - "selected", "deselected" (http://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html)
   *   - "mapBrowserEvent" (http://openlayers.org/en/latest/apidoc/module-ol_MapBrowserEvent-MapBrowserEvent.html)
   */
  activateSelectInteraction(options) {
    this.deactivateSelectInteraction();
    // TODO: "condition", etc.
    this[interactions].select = new Select({
      layers: [graphicLayer]
    });

    if (typeof options.onSelectedHandler === 'function') {
      this[interactions].select.on('selected', options.onSelectedHandler);
    }
    if (typeof options.onDeselectedHandler === 'function') {
      this[interactions].select.on('deselected', options.onDeselectedHandler);
    }

    this[map].addInteraction(this[interactions].select);
  }

  deactivateSelectInteraction() {
    if (this[interactions].select) {
      this[map].removeInteraction(this[interactions].select);
    }
  }

  /*
   * options:
   *   - onModifyStartHandler (on-event handler function)
   *   - onModifyEndHandler (on-event handler function)
   *
   * ---
   * Modify Event (http://openlayers.org/en/latest/apidoc/module-ol_interaction_Modify-ModifyEvent.html)
   * Properties:
   *   - "features" (http://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html)
   *   - "mapBrowserEvent" (http://openlayers.org/en/latest/apidoc/module-ol_MapBrowserEvent-MapBrowserEvent.html)
   */
  activateModifyInteraction(options) {
    this.deactivateModiifyInteraction();
    this[interactions].modify = new Modify({
      features: this[annotations],  // TODO: or source, i.e. "graphics"???
    });
    if (typeof options.onModifyStartHandler === 'function') {
      this[interactions].modify.on('modifystart', options.onModifyStartHandler);
    }
    if (typeof options.onModifyEndHandler === 'function') {
      this[interactions].modify.on('modifyend', options.onModifyEndHandler);
    }
    this[map].addInteraction(this[interactions].modify);
  }

  deactivateModifyInteraction() {
    if (this[interactions].modify) {
      this[map].removeInteraction(this[interactions].modify);
    }
  }

  getAllAnnotations() {
    // TODO: Openlayers Feature to DICOM SR JSON
    let arr = this[annotations].getArray();
    // this[annotations].forEach(func);
    let items = arr;
    return(items);
  }

  countAnnotations() {
    return(this[annotations].getLength());
  }

  getAnnotation(index) {
    let elem = this[annotations].item(index);
    // TODO: Openlayers Feature to DICOM SR JSON
    let item = elem;
    return(item);
  }

  addAnnotation(item) {
    // TODO: DICOM SR JSON to Openlayers Feature
    let elem = item;
    this[annotations].push(elem);
  }

  addMultipleAnnotations(items) {
    // TODO: DICOM SR JSON to Openlayers Feature
    let arr = items;
    this[annotations].extend(arr);
  }

  updateAnnotation(index, item) {
    // TODO: DICOM SR JSON to Openlayers Feature
    let elem = item;
    this[annotations].setAt(index, elem);
  }

  removeAnnotation(index) {
    this[annotations].removeAt(index);
  }

  set onAddAnnotationHandler(func) {
    this[annotations].on('add', func);
  }

  set onRemoveAnnotationHandler(func) {
    this[annotations].on('remove', func);
  }

  set onAddGraphicHandler(func) {
    this[graphics].on('addfeature', func);
  }

  set onRemoveGraphicHandler(func) {
    this[graphics].on('removefeature', func);
  }

  set onChangeGraphicHandler(func) {
    this[graphics].on('changefeature', func);
  }

  set onClearGraphicsHandler(func) {
    this[graphics].on('clearfeature', func);
  }

  set onClickHandler(func) {
    this[map].on('click', func);
  }

  set onSingleClickHandler(func) {
    this[map].on('singleclick', func);
  }

  set onDoubleClickHandler(func) {
    this[map].on('dblclick', func);
  }

  set onDragHandler(func) {
    this[map].on('pointerdrag', func);
  }

}

export { DICOMMicroscopyViewer };
