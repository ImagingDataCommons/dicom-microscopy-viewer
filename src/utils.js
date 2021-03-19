import { cross, inv, multiply } from "mathjs";
import { getPointResolution } from "ol/proj";
import dcmjs from "dcmjs";

import Enums from "./enums";

/** Generates a UUID-derived DICOM UID with root `2.25`.
 *
 * @returns {string} Unique identifier
 * @private
 */
function generateUID() {
  /**
   * A UUID can be represented as a single integer value.
   * http://dicom.nema.org/medical/dicom/current/output/chtml/part05/sect_B.2.html
   * https://www.itu.int/rec/T-REC-X.667-201210-I/en
   * To obtain the single integer value of the UUID, the 16 octets of the
   * binary representation shall be treated as an unsigned integer encoding
   * with the most significant bit of the integer encoding as the most
   * significant bit (bit 7) of the first of the sixteen octets (octet 15) and
   * the least significant bit as the least significant bit (bit 0) of the last
   * of the sixteen octets (octet 0).
   */
  // FIXME: This is not a valid UUID!
  let uid = "2.25." + Math.floor(1 + Math.random() * 9);
  while (uid.length < 44) {
    uid += Math.floor(1 + Math.random() * 10);
  }
  return uid;
}

/** Creates a rotation matrix.
 *
 * @param {Object} options - Options
 * @param {number[]} options.orientation - Direction cosines along the row and column direction of the Total Pixel Matrix for each of the three axis of the slide coordinate system
 * @returns {number[][]} 2x2 rotation matrix
 */
function createRotationMatrix(options) {
  if (!("orientation" in options)) {
    throw new Error('Option "orientation" is required.');
  }
  const orientation = options.orientation;
  const row_direction = orientation.slice(0, 3);
  const column_direction = orientation.slice(3, 6);
  return [
    [row_direction[0], column_direction[0]],
    [row_direction[1], column_direction[1]],
    [row_direction[2], column_direction[3]],
  ];
}

/** Computes the rotation of the image with respect to the frame of reference.
 *
 * @param {Object} options - Options
 * @param {number[]} options.orientation - Direction cosines along the row and column direction of the Total Pixel Matrix for each of the three axis of the slide coordinate system
 * @param {boolean} options.inDegrees - Whether angle should be returned in degrees instead of radians
 * @returns {number} Angle
 */
function computeRotation(options) {
  const rot = createRotationMatrix({ orientation: options.orientation });
  const angle = Math.atan2(-rot[0][1], rot[0][0]);
  var inDegrees = false;
  if ("inDegrees" in options) {
    inDegrees = true;
  }
  if (inDegrees) {
    return angle / (Math.PI / 180);
  } else {
    return angle;
  }
}

/** Builds an affine transformation matrix to map coordinates in the Total
 * Pixel Matrix into the slide coordinate system.
 *
 * @param {Object} options - Options
 * @param {number[]} options.offset - X and Y offset of the image in the slide coordinate system
 * @param {number[]} options.orientation - Direction cosines along the row and column direction of the Total Pixel Matrix for each of the three axis of the slide coordinate system
 * @param {number[]} options.spacing - Spacing between pixel rows and columns of the Total Pixel Matrix
 * @returns {number[][]} 3x3 affine transformation matrix
 */
function buildTransform(options) {
  // X and Y Offset in Slide Coordinate System
  if (!("offset" in options)) {
    throw new Error('Option "offset" is required.');
  }
  if (!Array.isArray(options.offset)) {
    throw new Error('Option "offset" must be an array.');
  }
  if (options.offset.length !== 2) {
    throw new Error('Option "offset" must be an array with 2 elements.');
  }

  // Image Orientation Slide with direction cosines for Row and Column direction
  if (!("orientation" in options)) {
    throw new Error('Option "orientation" is required.');
  }
  if (!Array.isArray(options.orientation)) {
    throw new Error('Option "orientation" must be an array.');
  }
  if (options.orientation.length !== 6) {
    throw new Error('Option "orientation" must be an array with 6 elements.');
  }

  // Pixel Spacing along the Row and Column direction
  if (!("spacing" in options)) {
    throw new Error('Option "spacing" is required.');
  }
  if (!Array.isArray(options.spacing)) {
    throw new Error('Option "spacing" must be an array.');
  }
  if (options.spacing.length !== 2) {
    throw new Error('Option "spacing" must be an array with 2 elements.');
  }

  const orientation = options.orientation;
  const offset = options.offset;
  const spacing = options.spacing;
  return [
    [orientation[0] * spacing[1], orientation[3] * spacing[0], offset[0]],
    [orientation[1] * spacing[1], orientation[4] * spacing[0], offset[1]],
    [0, 0, 1],
  ];
}

/** Applies an affine transformation to a coordinate in the Total Pixel Matrix
 * to map it into the slide coordinate system.
 *
 * @param {Object} options - Options
 * @params {number[]} options.coordinate - (Row, Column) position in the Total Pixel Matrix
 * @params {number[][]} options.affine - 3x3 affine transformation matrix
 * @returns {number[]} (X, Y) position in the slide coordinate system
 */
function applyTransform(options) {
  if (!("coordinate" in options)) {
    throw new Error('Option "coordinate" is required.');
  }
  if (!Array.isArray(options.coordinate)) {
    throw new Error('Option "coordinate" must be an array.');
  }
  if (options.coordinate.length !== 2) {
    throw new Error('Option "coordinate" must be an array with 2 elements.');
  }

  if (!("affine" in options)) {
    throw new Error('Option "affine" is required.');
  }
  if (!Array.isArray(options.affine)) {
    throw new Error('Option "affine" must be an array.');
  }
  if (options.affine.length !== 3) {
    throw new Error('Option "affine" must be a 3x3 array.');
  }
  if (!Array.isArray(options.affine[0])) {
    throw new Error('Option "affine" must be a 3x3 array.');
  }
  if (options.affine[0].length !== 3 || options.affine[1].length !== 3) {
    throw new Error('Option "affine" must be a 3x3 array.');
  }

  const coordinate = options.coordinate;
  const affine = options.affine;
  const imageCoordinate = [[coordinate[0]], [coordinate[1]], [1]];

  const slideCoordinate = multiply(affine, imageCoordinate);

  const x = Number(slideCoordinate[0][0].toFixed(4));
  const y = Number(slideCoordinate[1][0].toFixed(4));
  return [x, y];
}

/** Builds an affine transformation matrix to map coordinates in the slide
 * coordinate system into the Total Pixel Matrix.
 *
 * @param {number[]} options.offset - X and Y offset of the image in the slide coordinate system
 * @param {number[]} options.orientation - Direction cosines along the row and column direction of the Total Pixel Matrix for each of the three axis of the slide coordinate system
 * @param {number[]} options.spacing - Spacing between pixel rows and columns of the Total Pixel Matrix
 * @returns {number[][]} 3x3 affine transformation matrix
 */
function buildInverseTransform(options) {
  // X and Y Offset in Slide Coordinate System
  if (!("offset" in options)) {
    throw new Error('Option "offset" is required.');
  }
  if (!Array.isArray(options.offset)) {
    throw new Error('Option "offset" must be an array.');
  }
  if (options.offset.length !== 2) {
    throw new Error('Option "offset" must be an array with 2 elements.');
  }

  // Image Orientation Slide with direction cosines for Row and Column direction
  if (!("orientation" in options)) {
    throw new Error('Option "orientation" is required.');
  }
  if (!Array.isArray(options.orientation)) {
    throw new Error('Option "orientation" must be an array.');
  }
  if (options.orientation.length !== 6) {
    throw new Error('Option "orientation" must be an array with 6 elements.');
  }

  // Pixel Spacing along the Row and Column direction
  if (!("spacing" in options)) {
    throw new Error('Option "spacing" is required.');
  }
  if (!Array.isArray(options.spacing)) {
    throw new Error('Option "spacing" must be an array.');
  }
  if (options.spacing.length !== 2) {
    throw new Error('Option "spacing" must be an array with 2 elements.');
  }

  const orientation = options.orientation;
  const offset = options.offset;
  const spacing = options.spacing;
  const m = [
    [orientation[0] * spacing[1], orientation[3] * spacing[0], offset[0]],
    [orientation[1] * spacing[1], orientation[4] * spacing[0], offset[1]],
    [0, 0, 1],
  ];
  return inv(m);
}

/** Applies an affine transformation to a coordinate in the slide coordinate
 * system to map it into the Total Pixel Matrix.
 *
 * @param {Object} options - Options
 * @params {number[]} options.coordinate - (X, Y) position in the slide coordinate system
 * @params {number[][]} options.affine - 3x3 affine transformation matrix
 * @returns {number[]} (Row, Column) position in the Total Pixel Matrix
 */
function applyInverseTransform(options) {
  if (!("coordinate" in options)) {
    throw new Error('Option "coordinate" is required.');
  }
  if (!Array.isArray(options.coordinate)) {
    throw new Error('Option "coordinate" must be an array.');
  }
  if (options.coordinate.length !== 2) {
    throw new Error('Option "coordinate" must be an array with 2 elements.');
  }

  if (!("affine" in options)) {
    throw new Error('Option "affine" is required.');
  }
  if (!Array.isArray(options.affine)) {
    throw new Error('Option "affine" must be an array.');
  }
  if (options.affine.length !== 3) {
    throw new Error('Option "affine" must be a 3x3 array.');
  }
  if (!Array.isArray(options.affine[0])) {
    throw new Error('Option "affine" must be a 3x3 array.');
  }
  if (options.affine[0].length !== 3 || options.affine[1].length !== 3) {
    throw new Error('Option "affine" must be a 3x3 array.');
  }

  const coordinate = options.coordinate;
  const affine = options.affine;

  const slideCoordinate = [[coordinate[0]], [coordinate[1]], [1]];

  const pixelCoordinate = multiply(affine, slideCoordinate);

  const row = Number(pixelCoordinate[1][0].toFixed(4));
  const col = Number(pixelCoordinate[0][0].toFixed(4));
  return [col, row];
}

/** Maps 2D (Column, Row) image coordinate in the Total Pixel Matrix
 * to 3D (X, Y, Z) slide coordinates in the Frame of Reference.
 *
 * @param {Object} options - Options
 * @param {number[]} options.offset - X and Y offset in the slide coordinate system
 * @param {number[]} options.orientation - Direction cosines along the row and column direction of the Total Pixel Matrix for each of the three axis of the slide coordinate system
 * @param {number[]} options.spacing - Spacing between pixels along the Column and Row direction of the Total Pixel Matrix
 * @param {number[]} options.point - Column and Row position of the point in the Total Pixel Matrix
 * @returns {number[]} X, Y and Z position of the point in the slide coordinate system
 * @memberof utils
 */
function mapPixelCoordToSlideCoord(options) {
  if (!("point" in options)) {
    throw new Error('Option "point" is required.');
  }
  if (!Array.isArray(options.point)) {
    throw new Error('Option "point" must be an array.');
  }
  if (options.point.length !== 2) {
    throw new Error('Option "point" must be an array with 2 elements.');
  }
  const point = options.point;

  const affine = buildTransform({
    orientation: options.orientation,
    offset: options.offset,
    spacing: options.spacing,
  });
  return applyTransform({ coordinate: point, affine: affine });
}

/** Maps 3D (X, Y, Z) slide coordinate in to the Frame of Reference to
 * 2D (Column, Row) image coordinate in the Total Pixel Matrix.
 *
 * @param {Object} options - Options
 * @param {number[]} options.offset - X and Y offset in the slide coordinate system
 * @param {number[]} options.orientation - Direction cosines along the row and column direction of the Total Pixel Matrix for each of the three axis of the slide coordinate system
 * @param {number[]} options.spacing - Spacing between pixels along the Column and Row direction of the Total Pixel Matrix
 * @param {number[]} options.point - X, Y and Z position of the point in the slide coordinate system
 * @returns {number[]} Column and Row position of the point in the Total Pixel Matrix
 * @memberof utils
 */
function mapSlideCoordToPixelCoord(options) {
  if (!("point" in options)) {
    throw new Error('Option "point" is required.');
  }
  if (!Array.isArray(options.point)) {
    throw new Error('Option "point" must be an array.');
  }
  if (options.point.length !== 2) {
    throw new Error('Option "point" must be an array with 2 elements.');
  }
  const point = options.point;
  const affine = buildInverseTransform({
    orientation: options.orientation,
    offset: options.offset,
    spacing: options.spacing,
  });

  return applyInverseTransform({ coordinate: point, affine: affine });
}

/**
 * Get coordinate with offset
 *
 * @param {object} feature feature
 * @param {number} offset offset
 * @returns {array} coordinates with offset
 */
function coordinateWithOffset(feature, offset = 70) {
  const geometry = feature.getGeometry();
  const coordinates = geometry.getLastCoordinate();
  const [x, y] = coordinates;
  return !feature.get(Enums.InternalProperties.Marker) &&
    feature.get(Enums.InternalProperties.Markup) === Enums.Markup.TextEvaluation
    ? coordinates
    : [x - offset, y - offset];
}

/**
 * Get view unit suffix
 *
 * @param {object} view Map view
 * @returns {string} unit suffix
 */
function getUnitSuffix(view) {
  const UnitsEnum = { METERS: "m" };
  const DEFAULT_DPI = 25.4 / 0.28;

  const center = view.getCenter();
  const projection = view.getProjection();
  const resolution = view.getResolution();

  const pointResolutionUnits = UnitsEnum.METERS;

  let pointResolution = getPointResolution(
    projection,
    resolution,
    center,
    pointResolutionUnits
  );

  const DEFAULT_MIN_WIDTH = 65;
  const minWidth = (DEFAULT_MIN_WIDTH * DEFAULT_DPI) / DEFAULT_DPI;

  let nominalCount = minWidth * pointResolution;
  let suffix = "";

  if (nominalCount < 0.001) {
    suffix = "μm";
    pointResolution *= 1000000;
  } else if (nominalCount < 1) {
    suffix = "mm";
    pointResolution *= 1000;
  } else if (nominalCount < 1000) {
    suffix = "m";
  } else {
    suffix = "km";
    pointResolution /= 1000;
  }

  return suffix;
}

/**
 * Get a num content item instance given value, code, meaning and units
 *
 * @param {number} value the measurement value
 * @param {string} nameCodedConceptValue the coded concept value
 * @param {string} nameCodedConceptMeaning the value coded concept meaning
 * @param {string} unitCodedConceptValue the unit coded concept value
 * @param {string} unitCodedConceptMeaning the unit coded concept meaning
 * @returns {object} num content item instance
 */
const getMeasurementContentItem = (
  value,
  nameCodedConceptValue,
  nameCodedConceptMeaning,
  unitCodedConceptValue,
  unitCodedConceptMeaning
) => {
  return new dcmjs.sr.valueTypes.NumContentItem({
    name: new dcmjs.sr.coding.CodedConcept({
      value: nameCodedConceptValue,
      meaning: nameCodedConceptMeaning,
      schemeDesignator: "DCM",
    }),
    value,
    unit: new dcmjs.sr.coding.CodedConcept({
      value: unitCodedConceptValue,
      meaning: unitCodedConceptMeaning,
      schemeDesignator: "DCM",
    }),
  });
};

/**
 * Get a text content item instance given value, code and meaning
 *
 * @param {string} text the text
 * @param {string} nameCodedConceptValue the text coded concept value
 * @param {string} textCodedConceptMeaning the text coded concept meaning
 * @returns {object} text content item instance
 */
const getTextEvaluationContentItem = (
  text,
  nameCodedConceptValue,
  nameCodedConceptMeaning
) => {
  return new dcmjs.sr.valueTypes.TextContentItem({
    name: new dcmjs.sr.coding.CodedConcept({
      value: nameCodedConceptValue,
      meaning: nameCodedConceptMeaning,
      schemeDesignator: "DCM",
    }),
    value: text,
    relationshipType: Enums.RelationshipTypes.HAS_OBS_CONTEXT,
  });
};

/**
 * Get name coded concept from content item
 *
 * @param {object} contentItem
 * @returns {object} The concept name coded concept
 */
const getContentItemNameCodedConcept = (contentItem) =>
  contentItem.ConceptNameCodeSequence.length
    ? contentItem.ConceptNameCodeSequence[0]
    : contentItem.ConceptNameCodeSequence;

/**
 * Gets the code meaning of the name coded concept of a content item
 *
 * @param {object} contentItem The content item
 */
const getContentItemNameMeaning = (contentItem) => {
  const { ConceptNameCodeSequence } = contentItem;
  return ConceptNameCodeSequence.length
    ? ConceptNameCodeSequence[0].CodeMeaning
    : ConceptNameCodeSequence.CodeMeaning;
};

/**
 *
 * @param {object} codedConcept1
 * @param {object} codedConcept2
 * @returns {boolean} true if content items equal and false otherwise
 */
const isCodedConceptEqual = (codedConcept1, codedConcept2) => {
  if (
    codedConcept2.value === codedConcept1.value &&
    codedConcept2.schemeDesignator === codedConcept1.schemeDesignator
  ) {
    if (codedConcept2.schemeVersion && codedConcept1.schemeVersion) {
      return codedConcept2.schemeVersion === codedConcept1.schemeVersion;
    }
    return true;
  }
  return false;
};

/**
 *
 * @param {object} contentItem1
 * @param {object} contentItem2
 * @returns {boolean} true if content items equal and false otherwise
 */
const isContentItemsEqual = (contentItem1, contentItem2) => {
  const contentItem1NameCodedConcept = getContentItemNameCodedConcept(
    contentItem1
  );
  const contentItem2NameCodedConcept = getContentItemNameCodedConcept(
    contentItem2
  );
  return contentItem1NameCodedConcept.equals
    ? contentItem1NameCodedConcept.equals(contentItem2NameCodedConcept)
    : isCodedConceptEqual(
        contentItem1NameCodedConcept,
        contentItem2NameCodedConcept
      );
};

export {
  getUnitSuffix,
  applyInverseTransform,
  applyTransform,
  buildInverseTransform,
  buildTransform,
  computeRotation,
  generateUID,
  mapPixelCoordToSlideCoord,
  mapSlideCoordToPixelCoord,
  isContentItemsEqual,
  isCodedConceptEqual,
  getContentItemNameCodedConcept,
  getMeasurementContentItem,
  getTextEvaluationContentItem,
  getContentItemNameMeaning,
  coordinateWithOffset,
};
