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
import Feature from 'ol/Feature';
import { default as PolygonGeometry } from 'ol/geom/Polygon';
import { default as PointGeometry } from 'ol/geom/Point';
import { default as LingStringGeometry } from 'ol/geom/LineString';
import { default as CircleGeometry } from 'ol/geom/Circle';

import { getCenter } from 'ol/extent';
import { toStringXY } from 'ol/coordinate';

import { formatImageMetadata } from './metadata.js';
import { Point, Multipoint, Polyline, Circle, Ellipse } from './scoord.js';

import DICOMwebClient from 'dicomweb-client/build/dicomweb-client.js'


function _geometry2Scoord(geometry) {
  const type = geometry.getType()
  if (type === 'Point') {
    let coordinates = geometry.getCoordinates();
    coordinates = _geometryCoordinates2scoordCoordinates(coordinates);
    return new Point(coordinates);
  } else if (type === 'Polygon') {
    /*
     * The first linear ring of the array defines the outer-boundary (surface).
     * Each subsequent linear ring defines a hole in the surface.
     */
    let coordinates = geometry.getCoordinates()[0].map(c => {
      return _geometryCoordinates2scoordCoordinates(c);
    });
    return new Polyline(coordinates);
  } else if (type === 'LineString') {
    let coordinates = geometry.getCoordinates().map(c => {
      return _geometryCoordinates2scoordCoordinates(c);
    });
    return new Polyline(coordinates);
  } else if (type === 'Circle') {
    // TODO: Circle may actually represent a Polyline
    let center = _geometryCoordinates2scoordCoordinates(geometry.getCenter());
    let radius = geometry.getRadius();
    return new Circle(center, radius);
  } else {
    // TODO: Combine multiple points into MULTIPOINT.
    console.error(`unknown geometry type "${type}"`)
  }
}


function _scoord2Geometry(scoord) {
  const type = scoord.graphicType;
  const data = scoord.graphicData;
  if (type === 'POINT') {
    let coordinates = _scoordCoordinates2geometryCoordinates(data);
    return new PointGeometry(coordinates);
  } else if (type === 'MULTIPOINT') {
    const points = []
    for (d in data) {
      let coordinates = _scoordCoordinates2geometryCoordinates(d);
      let p = new PointGeometry(coordinates);
      points.push(p);
    }
    return points;
  } else if (type === 'POLYLINE') {
    if (data[0] === data[data.length-1]) {
      let coordinates = [_scoordCoordinates2geometryCoordinates(data)];
      return new PolygonGeometry(coordinates);
    } else {
      let coordinates = _scoordCoordinates2geometryCoordinates(data);
      return new LineStringGeometry(coordinates);
    }
  } else if (type === 'CIRCLE') {
    let coordinates = _scoordCoordinates2geometryCoordinates(data);
    let center = coordinates[0];
    let radius = Math.abs(coordinates[1][0] - coordinates[0][0]);
    return new CircleGeometry(center, radius);
  } else if (type === 'ELLIPSE') {
    // TODO: create custom Openlayers Geometry
  } else {
    console.error(`unknown graphic type "${type}"`)
  }
}


function _geometryCoordinates2scoordCoordinates(coordinates) {
  // TODO: Transform to coordinates on pyramid base layer???
  return [coordinates[0] + 1, -coordinates[1]]
}


function _scoordCoordinates2geometryCoordinates(coordinates) {
  return [coordinates[0] - 1, -coordinates[1]]
}


const _usewebgl = Symbol('usewebgl');
const _map = Symbol('map');
const _features = Symbol('features');
const _drawingSource = Symbol('drawingSource');
const _drawingLayer = Symbol('drawingLayer');
const _segmentations = Symbol('segmentations');
const _pyramid = Symbol('pyramid');
const _client = Symbol('client');
const _controls = Symbol('controls');
const _interactions = Symbol('interactions');


class VLWholeSlideMicroscopyImageViewer {

  /*
   * options:
   *   - client (instance of DICOMwebClient)
   *   - metadata (array of DICOM JSON metadata for each image instance)
   *   - useWebGL (whether WebGL renderer should be used; default: true)
   *   - onClickHandler (on-event handler function)
   *   - onSingleClickHandler (on-event handler function)
   *   - onDoubleClickHandler (on-event handler function)
   *   - onDragHandler (on-event handler function)
   *   - onAddScoordHandler (on-event handler function)
   *   - onRemoveScoordHandler (on-event handler function)
   *   - onAddFeatureHandler (on-event handler function)
   *   - onRemoveFeatureHandler (on-event handler function)
   *   - onChangeFeatureHandler (on-event handler function)
   *   - onClearFeaturesHandler (on-event handler function)
   *
   * ---
   * Map Event (http://openlayers.org/en/latest/apidoc/module-ol_MapBrowserEvent-MapBrowserEvent.html)
   * Properties:
   *   - coordinate (http://openlayers.org/en/latest/apidoc/module-ol_coordinate.html#~Coordinate)
   *   - pixel
   */
  constructor(options) {
    if ('useWebGL' in options) {
      this[_usewebgl] = options.useWebGL;
    } else {
      this[_usewebgl] = true;
    }
    this[_client] = options.client;

    // Collection of Openlayers "VectorLayer" instances indexable by
    // DICOM Series Instance UID
    this[_segmentations] = {};

    // Collection of Openlayers "Feature" instances
    this[_features] = new Collection([], {unique: true});

    if (typeof options.onAddScoordHandler === 'function') {
      this[_features].on('add', options.onAddScoordHandler);
    }
    if (typeof options.onRemoveScoordHandler === 'function') {
      this[_features].on('add', options.onRemoveScoordHandler);
    }

    /*
     * To visualize images accross multiple scales, we first need to
     * determine the image pyramid structure, i.e. the size and resolution
     * images at the different pyramid levels.
    */
    const metadata = options.metadata.map(m => formatImageMetadata(m));
    this[_pyramid] = [];
    for (let i = 0; i < metadata.length; i++) {
      const cols = metadata[i].totalPixelMatrixColumns;
      const rows = metadata[i].totalPixelMatrixRows;
      const mapping = metadata[i].frameMapping;
      /*
       * Instances may be broken down into multiple concatentation parts.
       * Therefore, we have to re-assemble instance metadata.
      */
      let alreadyExists = false;
      let index = null;
      for (let j = 0; j < this[_pyramid].length; j++) {
        if (
            (this[_pyramid][j].totalPixelMatrixColumns === cols) &&
            (this[_pyramid][j].totalPixelMatrixRows === rows)
          ) {
          alreadyExists = true;
          index = j;
        }
      }
      if (alreadyExists) {
        // Update with information obtained from current concatentation part.
        Object.assign(this[_pyramid][index].frameMapping, mapping);
      } else {
        this[_pyramid].push(metadata[i]);
      }
    }
    // Sort levels in ascending order
    this[_pyramid].sort(function(a, b) {
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
    const nLevels = this[_pyramid].length;
    for (let j = 0; j < nLevels; j++) {
      let columns = this[_pyramid][j].columns;
      let rows = this[_pyramid][j].rows;
      let totalPixelMatrixColumns = this[_pyramid][j].totalPixelMatrixColumns;
      let totalPixelMatrixRows = this[_pyramid][j].totalPixelMatrixRows;
      let pixelSpacing = this[_pyramid][j].pixelSpacing;
      let colFactor = Math.ceil(totalPixelMatrixColumns / columns);
      let rowFactor = Math.ceil(totalPixelMatrixRows / rows);
      tileSizes.push([columns, rows]);
      totalSizes.push([columns * colFactor, rows * rowFactor]);

      /*
       * Compute the resolution at each pyramid level, since the zoom
       * factor may not be the same between adjacent pyramid levels.
      */
      let zoomFactor =  this[_pyramid][nLevels-1].totalPixelMatrixRows / totalPixelMatrixRows;
      resolutions.push(zoomFactor);

      /*
       * TODO: One may have to adjust the offset slightly due to the
       * difference between extent of the image at a resolution level
       * and the actual number of tiles (frames).
      */
      let orig = [0, -1]
      if (j < this[_pyramid].length-1) {
        origins.push(orig)
      }
    }
    totalSizes.reverse();
    tileSizes.reverse();
    origins.reverse();

    // We can't call "this" inside functions.
    const pyramid = this[_pyramid];

    /*
      * Translate pixel units of total pixel matrix into millimeters of
      * slide coordinate system
    */
    function coordinateFormatFunction(coordinate) {
      x = (coordinate[0] * pyramid[pyramid.length-1].pixelSpacing[0]).toFixed(4);
      y = (-(coordinate[1] - 1) * pyramid[pyramid.length-1].pixelSpacing[1]).toFixed(4);
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
      let path = pyramid[z].frameMapping[index];
      if (path === undefined) {
        console.warn("tile " + index + " not found at level " + z);
        return(null);
      }
      let url = options.client.baseURL +
        "/studies/" + pyramid[z].studyInstanceUID +
        "/series/" + pyramid[z].seriesInstanceUID +
        '/instances/' + path;
      return(url);
    }

    /*
     * Define custonm tile loader function, which is required because the
     * WADO-RS response message has content type "multipart/related".
    */
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
        const imageSubType = 'jpeg';  // FIXME
        const retrieveOptions = {
          studyInstanceUID,
          seriesInstanceUID,
          sopInstanceUID,
          frameNumbers,
          imageSubType
        };
        options.client.retrieveInstanceFrames(retrieveOptions).then((frames) => {
          // Encode pixel data as base64 string
          const encodedPixels = base64Encode(frames[0]);
          // Add pixel data to image
          tile.getImage().src = "data:image/" + imageSubType + ";base64," + encodedPixels;
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
      0,                                           // min X
      -pyramid[nLevels-1].totalPixelMatrixRows,    // min Y
      pyramid[nLevels-1].totalPixelMatrixColumns,  // max X
      -1                                           // max Y
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
      (this[_pyramid][this[_pyramid].length-1].imageOrientationSlide[1] === -1) &&
      (this[_pyramid][this[_pyramid].length-1].imageOrientationSlide[3] === -1)
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
        let spacing = pyramid[nLevels-1].pixelSpacing[0] / 10**3;
        let res = pixelRes * spacing;
        return(res);
      }
    });
    /*
     * TODO: Register custom projection:
     *  - http://openlayers.org/en/latest/apidoc/ol.proj.html
     *  - http://openlayers.org/en/latest/apidoc/module-ol_proj.html#~ProjectionLike
     * Direction cosines could be handled via projection rather
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

    this[_drawingSource] = new VectorSource({
      tileGrid: tileGrid,
      projection: projection,
      wrapX: false
    });

    if (typeof options.onAddFeatureHandler === 'function') {
      this[_drawingSource].on('addfeature', options.onAddFeatureHandler);
    }
    if (typeof options.onRemoveFeatureHandler === 'function') {
      this[_drawingSource].on('removefeature', options.onRemoveFeatureHandler);
    }
    if (typeof options.onChangeFeatureHandler === 'function') {
      this[_drawingSource].on('changefeature', options.onChangeFeatureHandler);
    }
    if (typeof options.onClearFeaturesHandler === 'function') {
      this[_drawingSource].on('clearfeature', options.onClearFeaturesHandler);
    }

    // TODO: allow user to configure style (required for text labels)
    // http://openlayers.org/en/latest/apidoc/module-ol_style_Style-Style.html
    this[_drawingLayer] = new VectorLayer({
      extent: extent,
      source: this[_drawingSource],
      projection: projection,
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

    this[_controls] = {
      scaleLine: new ScaleLine({
        units: 'metric',
        className: 'dicom-microscopy-viewer-scale'
      }),
    // overview: new OverviewMap({
    //   view: overviewView,
    //   collapsed: true,
    //   className: 'dicom-microscopy-viewer-overview'
    // }),
    //   zoom: new Zoom({
    //     className: 'dicom-microscopy-viewer-zoom'
    //   }),
    //   zoomSlider: new ZoomSlider({
    //     className: 'dicom-microscopy-viewer-zoom-slider'
    //   }),
    //   fullScreen: new FullScreen({
    //     className: 'dicom-microscopy-viewer-fullscreen'
    //   }),
    };

    /*
     * Creates the map with the defined layers and view and renders it via
     * WebGL.
     */
    if (this[_usewebgl]) {
      this[_map] = new WebGLMap({
        layers: [imageLayer, this[_drawingLayer]],
        view: view,
        controls: [],
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        logo: false
      });
    } else {
      this[_map] = new Map({
        layers: [imageLayer, this[_drawingLayer]],
        view: view,
        controls: [],
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        logo: false
      });
    }
    for (let control in this[_controls]) {
      // options.controls
      // TODO: enable user to select controls and style them
      // TODO: enable users to define "target" containers for controls
      this[_map].addControl(this[_controls][control]);
    }
    this[_map].getView().fit(extent, this[_map].getSize());

    if (typeof options.onClickHandler === 'function') {
      this[_map].on('click', options.onClickHandler);
    }
    if (typeof options.onSingleClickHandler === 'function') {
      this[_map].on('singleclick', options.onSingleClickHandler);
    }
    if (typeof options.onDoubleClickHandler === 'function') {
      this[_map].on('dblclick', options.onDoubleClickHandler);
    }
    if (typeof options.onDragHandler === 'function') {
      this[_map].on('pointerdrag', options.onDragHandler);
    }

    this[_interactions] = {
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
    this[_map].setTarget(options.container);

    // Style scale element (overriding default Openlayers CSS "ol-scale-line")
    let scaleElements = document.getElementsByClassName(
      'dicom-microscopy-viewer-scale'
    );
    for (let i = 0; i < scaleElements.length; ++i) {
      let item = scaleElements[i];
      item.style.position = 'absolute';
      item.style.right = '.5em';
      item.style.bottom = '.5em';
      item.style.left = 'auto';
      item.style.padding = '2px';
      item.style.backgroundColor = 'rgba(255,255,255,.5)';
      item.style.borderRadius = '4px';
      item.style.margin = '1px';
    }
    let scaleInnerElements = document.getElementsByClassName(
      'dicom-microscopy-viewer-scale-inner'
    );
    for (let i = 0; i < scaleInnerElements.length; ++i) {
      let item = scaleInnerElements[i];
      item.style.color = 'black';
      item.style.fontWeight = '600';
      item.style.fontSize = '10px';
      item.style.textAlign = 'center';
      item.style.borderWidth = '1.5px';
      item.style.borderStyle = 'solid';
      item.style.borderTop = 'none';
      item.style.borderRightColor = 'black';
      item.style.borderLeftColor = 'black';
      item.style.borderBottomColor = 'black';
      item.style.margin = '1px';
      item.style.willChange = 'contents,width';
    }

  }

}

export { VLWholeSlideMicroscopyImageViewer };
