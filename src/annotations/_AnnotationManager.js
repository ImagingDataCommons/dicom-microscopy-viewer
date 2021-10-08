import dcmjs from "dcmjs";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import Circle from "ol/geom/Circle";

import _MarkupManager from "./markups/_MarkupManager";

/** Enums */
import Enums from "../enums";

/** Markers */
import ArrowMarker, { format as arrowFormat } from "./markers/arrow";

/** Markups */
import MeasurementMarkup, {
  format as measurementFormat,
} from "./markups/measurement";
import TextEvaluationMarkup, {
  format as textFormat,
} from "./markups/textEvaluation";

/** Utils */
import {
  areCodedConceptsEqual,
  getContentItemNameCodedConcept,
} from "../utils";
import Modify from "ol/interaction/Modify";
import setHandlesPosition from "./setHandlesPosition";

const { Marker, Markup } = Enums;

// Returns sign of number
function sign(x) {
  return typeof x === "number"
    ? x
      ? x < 0
        ? -1
        : 1
      : x === x
      ? 0
      : NaN
    : NaN;
}

// Returns intersection points of two lines
function getIntersection(lineSegment1, lineSegment2) {
  const intersectionPoint = {};

  let x1 = lineSegment1.start.x,
    y1 = lineSegment1.start.y,
    x2 = lineSegment1.end.x,
    y2 = lineSegment1.end.y,
    x3 = lineSegment2.start.x,
    y3 = lineSegment2.start.y,
    x4 = lineSegment2.end.x,
    y4 = lineSegment2.end.y;

  // Coefficients of line equations
  let a1, a2, b1, b2, c1, c2;
  // Sign values
  let r1, r2, r3, r4;

  // Intermediate values
  let denom, num;

  // Compute a1, b1, c1, where line joining points 1 and 2 is "a1 x  +  b1 y  +  c1  =  0"
  a1 = y2 - y1;
  b1 = x1 - x2;
  c1 = x2 * y1 - x1 * y2;

  // Compute r3 and r4
  r3 = a1 * x3 + b1 * y3 + c1;
  r4 = a1 * x4 + b1 * y4 + c1;

  /* Check signs of r3 and r4.  If both point 3 and point 4 lie on
   * same side of line 1, the line segments do not intersect.
   */

  if (r3 !== 0 && r4 !== 0 && sign(r3) === sign(r4)) {
    return;
  }

  // Compute a2, b2, c2
  a2 = y4 - y3;
  b2 = x3 - x4;
  c2 = x4 * y3 - x3 * y4;

  // Compute r1 and r2
  r1 = a2 * x1 + b2 * y1 + c2;
  r2 = a2 * x2 + b2 * y2 + c2;

  /* Check signs of r1 and r2.  If both point 1 and point 2 lie
   * on same side of second line segment, the line segments do
   * not intersect.
   */

  if (r1 !== 0 && r2 !== 0 && sign(r1) === sign(r2)) {
    return;
  }

  /* Line segments intersect: compute intersection point.
   */

  denom = a1 * b2 - a2 * b1;

  /* The denom/2 is to get rounding instead of truncating.  It
   * is added or subtracted to the numerator, depending upon the
   * sign of the numerator.
   */

  num = b1 * c2 - b2 * c1;
  const x = parseFloat(num / denom);

  num = a2 * c1 - a1 * c2;
  const y = parseFloat(num / denom);

  intersectionPoint.x = x;
  intersectionPoint.y = y;

  return intersectionPoint;
}

function subtract(lhs, rhs) {
  return {
    x: lhs.x - rhs.x,
    y: lhs.y - rhs.y,
  };
}

function distance(from, to) {
  return Math.sqrt(distanceSquared(from, to));
}

function distanceSquared(from, to) {
  const delta = subtract(from, to);
  return delta.x * delta.x + delta.y * delta.y;
}

class _AnnotationManager {
  constructor({ map, features, pyramid, drawingLayer, drawingSource } = {}) {
    const markupManager = new _MarkupManager({
      map,
      pyramid,
      formatters: {
        [Marker.Arrow]: arrowFormat,
        [Markup.Measurement]: measurementFormat,
        [Markup.TextEvaluation]: textFormat,
      },
    });

    this.props = {
      map,
      pyramid,
      markupManager,
    };

    /** Markups */
    this[Markup.Measurement] = MeasurementMarkup(this.props);
    this[Markup.TextEvaluation] = TextEvaluationMarkup(this.props);

    /** Markers */
    this[Marker.Arrow] = ArrowMarker(this.props);

    this.onDrawStart = this.onDrawStart.bind(this);

    this.features = features;
    this.map = map;
    this.drawingLayer = drawingLayer;
    this.drawingSource = drawingSource;
  }

  /**
   * Add markup properties based on ROI
   * measurements and evaluations.
   *
   * @param {Feature} feature The feature
   */
  _addMeasurementsAndEvaluationsProperties(feature) {
    const { measurements, evaluations } = feature.getProperties();

    if (measurements && measurements.length) {
      return measurements.some((measurement) => {
        // eslint-disable-line
        const SUPPORTED_MEASUREMENTS_CODED_CONCEPTS = [
          new dcmjs.sr.coding.CodedConcept({
            meaning: "Area",
            value: "42798000",
            schemeDesignator: "SCT",
          }),
          new dcmjs.sr.coding.CodedConcept({
            meaning: "Length",
            value: "410668003",
            schemeDesignator: "SCT",
          }),
        ];
        const measurementCodedConcept =
          getContentItemNameCodedConcept(measurement);
        if (
          SUPPORTED_MEASUREMENTS_CODED_CONCEPTS.some((codedConcept) =>
            areCodedConceptsEqual(measurementCodedConcept, codedConcept)
          )
        ) {
          feature.set(
            Enums.InternalProperties.Markup,
            Enums.Markup.Measurement
          );
        }
      });
    }

    if (evaluations && evaluations.length) {
      return evaluations.some((evaluation) => {
        // eslint-disable-line
        const SUPPORTED_EVALUATIONS_CODED_CONCEPTS = [
          new dcmjs.sr.coding.CodedConcept({
            value: "112039",
            meaning: "Tracking Identifier",
            schemeDesignator: "DCM",
          }),
        ];
        const evaluationCodedConcept =
          getContentItemNameCodedConcept(evaluation);
        if (
          SUPPORTED_EVALUATIONS_CODED_CONCEPTS.some((codedConcept) =>
            areCodedConceptsEqual(codedConcept, evaluationCodedConcept)
          )
        ) {
          feature.set(
            Enums.InternalProperties.Markup,
            Enums.Markup.TextEvaluation
          );
        }
      });
    }
  }

  /**
   * Sets annotations visibility.
   *
   * @param {boolean} isVisible
   */
  setVisible(isVisible) {
    this.props.markupManager.setVisible(isVisible);
  }

  onAdd(feature) {
    /**
     * Add properties to ROI feature before triggering
     * markup and markers callbacks to keep UI in sync.
     */
    this._addMeasurementsAndEvaluationsProperties(feature);

    this[Marker.Arrow].onAdd(feature);
    this[Markup.Measurement].onAdd(feature);
    this[Markup.TextEvaluation].onAdd(feature);
  }

  onFailure(uid) {
    this[Marker.Arrow].onFailure(uid);
    this[Markup.Measurement].onFailure(uid);
    this[Markup.TextEvaluation].onFailure(uid);
  }

  onRemove(feature) {
    this[Marker.Arrow].onRemove(feature);
    this[Markup.Measurement].onRemove(feature);
    this[Markup.TextEvaluation].onRemove(feature);
  }

  onUpdate(feature) {
    this[Marker.Arrow].onUpdate(feature);
    this[Markup.Measurement].onUpdate(feature);
    this[Markup.TextEvaluation].onUpdate(feature);
  }

  onDrawStart(event, options, _setFeatureStyle) {
    this[Marker.Arrow].onDrawStart(event);
    this[Markup.Measurement].onDrawStart(event);
    this[Markup.TextEvaluation].onDrawStart(event);

    const features = this.features;

    if (options.geometryType === "line" && options.bidirectional === true) {
      const longAxisFeature = event.feature;

      longAxisFeature.setProperties({ isLongAxis: true }, true);

      const interactions = this.map.getInteractions();
      const modify = interactions.getArray().find(i => i instanceof Modify);
      const onModifyHandler = event => {
        const { coordinate } = event.mapBrowserEvent;
        const feature = this.drawingSource.getClosestFeatureToCoordinate(coordinate);
        const geometry = feature.getGeometry();
        const previousCoordinates = geometry.getCoordinates();
        geometry.setProperties({ previousCoordinates }, true);
      };
      modify.on('modifystart', onModifyHandler);
      modify.on('modifyend', onModifyHandler);

      this.map.on('pointerdrag', event => {
        const coordinate = event.coordinate;
        const feature = this.drawingSource.getClosestFeatureToCoordinate(coordinate);
        const { isLongAxis, isShortAxis } = feature.getProperties();

        if (isLongAxis) {
          const shortAxisFeatureId = `short-axis-${feature.getId()}`;
          const shortAxisFeature = this.drawingSource.getFeatureById(shortAxisFeatureId);
          setHandlesPosition({ x: 0, y: 0 }, event, feature, shortAxisFeature);
          return;
        }

        if (isShortAxis) {
          const longAxisFeatureId = feature.getId().split('short-axis-')[1];
          const longAxisFeature = this.drawingSource.getFeatureById(longAxisFeatureId);
          setHandlesPosition({ x: 0, y: 0 }, event, longAxisFeature, feature);
          return;
        }
      });

      longAxisFeature
        .getGeometry()
        .on(Enums.FeatureGeometryEvents.CHANGE, (event) => {
          const longAxisGeometry = event.target;

          const [startPoints, endPoints] = longAxisGeometry.getCoordinates();
          const start = { x: startPoints[0], y: startPoints[1] };
          const end = { x: endPoints[0], y: endPoints[1] };
          const perpendicularAxis = getPerpendicularAxis({ start, end });

          const shortAxisCoordinates = [
            [perpendicularAxis.start.x, perpendicularAxis.start.y],
            [perpendicularAxis.end.x, perpendicularAxis.end.y],
          ];

          const id = `short-axis-${longAxisFeature.getId()}`;
          const existentShortAxisFeature = features
            .getArray()
            .find((f) => f.getId() === id);

          if (existentShortAxisFeature) {
            // TODO: deal with existent short axis (avoid changing it every time, keep length and positions)
            const existentShortAxisGeometry = existentShortAxisFeature.getGeometry();
            existentShortAxisGeometry.setCoordinates(shortAxisCoordinates);
    
            existentShortAxisFeature.setGeometry(existentShortAxisGeometry);

            return;
          }

          const shortAxisGeometry = new LineString(shortAxisCoordinates);
          shortAxisGeometry.setCoordinates(shortAxisCoordinates);

          const shortAxisFeature = new Feature({
            geometry: shortAxisGeometry,
            name: "Line",
          });
          shortAxisFeature.setId(id);
          shortAxisFeature.setProperties({ isShortAxis: true }, true);

          _setFeatureStyle(
            shortAxisFeature,
            options[Enums.InternalProperties.StyleOptions]
          );

          features.push(shortAxisFeature);
        });
    }
  }

  setDraw(drawInteraction) {
    this.draw = drawInteraction;
  }

  onDrawEnd(event) {
    this[Marker.Arrow].onDrawEnd(event);
    this[Markup.Measurement].onDrawEnd(event);
    this[Markup.TextEvaluation].onDrawEnd(event);
    this.props.markupManager.onDrawEnd(event);
  }

  onDrawAbort(event) {
    this[Marker.Arrow].onDrawAbort(event);
    this[Markup.Measurement].onDrawAbort(event);
    this[Markup.TextEvaluation].onDrawAbort(event);
    this.props.markupManager.onDrawAbort(event);
  }
}

export default _AnnotationManager;

const getPerpendicularAxis = (line, imageMetadata = {}) => {
  // getPixelSpacing (metadata) from scoord utils (image metadata)
  const getLineVector = (
    columnPixelSpacing,
    rowPixelSpacing,
    startPoint,
    endPoint
  ) => {
    const dx = (startPoint.x - endPoint.x) * columnPixelSpacing;
    const dy = (startPoint.y - endPoint.y) * rowPixelSpacing;
    const length = Math.sqrt(dx * dx + dy * dy);
    const vectorX = dx / length;
    const vectorY = dy / length;

    return {
      x: vectorX,
      y: vectorY,
      length,
    };
  };

  let startX, startY, endX, endY;

  const { start, end } = line;
  const { columnPixelSpacing = 1, rowPixelSpacing = 1 } = imageMetadata;

  if (start.x === end.x && start.y === end.y) {
    startX = start.x;
    startY = start.y;
    endX = end.x;
    endY = end.y;
  } else {
    // Mid point of long-axis line
    const mid = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    };

    // Inclination of the perpendicular line
    const vector = getLineVector(
      columnPixelSpacing,
      rowPixelSpacing,
      start,
      end
    );

    const perpendicularLineLength = vector.length / 2;
    const rowMultiplier = perpendicularLineLength / (2 * rowPixelSpacing);
    const columnMultiplier = perpendicularLineLength / (2 * columnPixelSpacing);

    startX = mid.x + columnMultiplier * vector.y;
    startY = mid.y - rowMultiplier * vector.x;
    endX = mid.x - columnMultiplier * vector.y;
    endY = mid.y + rowMultiplier * vector.x;
  }

  const perpendicular = { start: {}, end: {} };
  perpendicular.start.x = startX;
  perpendicular.start.y = startY;
  perpendicular.end.x = endX;
  perpendicular.end.y = endY;
  return perpendicular;
};
