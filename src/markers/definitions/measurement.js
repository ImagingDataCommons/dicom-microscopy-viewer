import { getLength, getArea } from 'ol/sphere';
import { fromCircle } from 'ol/geom/Polygon';
import Circle from 'ol/geom/Circle';
import dcmjs from 'dcmjs';

import { Marker } from '../enums';
import { defaultStyle } from '../styles';
import { getUnitsSuffix } from '../utils';

const getStyleFunction = (options) => {
  return (feature, resolution) => {
    const styles = [];

    if (isMeasurement(feature)) {
      styles.push(defaultStyle);
    }

    return styles;
  };
};

/**
 * Format measure output
 * @param {Feature} feature feature
 * @param {Geometry} geometry geometry
 * @return {string} The formatted measure of this feature
 */
const formatMeasurement = (feature, geometry, units) => {
  let output = Math.round((rawMeasurement(feature, geometry) / 10) * 100) / 100 + ' ' + units;
  return output;
};

/**
 * Get measurement from feature
 * @param {Feature} feature feature
 * @param {Geometry} geometry geometry
 * @return {string} The formatted measure of this feature
 */
const rawMeasurement = (feature, geometry) => {
  let geom = feature ? feature.getGeometry() : geometry;
  if (geom instanceof Circle) geom = fromCircle(geom);
  const value = getLength(geom) ? getLength(geom) : getArea(geom);
  let output = Math.round((value / 10) * 100) / 100;
  return output;
};

const isMeasurement = feature => Marker.Measurement === feature.get('marker');

const getMeasurementsAndEvaluations = (feature, roi, api) => {
  const { scoord3d } = roi;

  const evaluations = [
    new dcmjs.sr.valueTypes.CodeContentItem({
      name: new dcmjs.sr.coding.CodedConcept({
        value: "marker",
        meaning: "Marker Identification",
        schemeDesignator: "dicom-microscopy-viewer"
      }),
      value: new dcmjs.sr.coding.CodedConcept({
        value: Marker.Measurement,
        meaning: "Marker Type",
        schemeDesignator: "dicom-microscopy-viewer"
      }),
      relationshipType: 'HAS CONCEPT MOD'
    })
  ];

  const view = api.map.getView();
  const unit = getUnitsSuffix(view);
  const measurement = rawMeasurement(feature, null, unit);
  const uid = feature.getId();
  const identifier = `#ROI ${uid}`;

  const measurementItem = new dcmjs.sr.valueTypes.NumContentItem({
    name: new dcmjs.sr.coding.CodedConcept({
      value: feature.get('label') || '',
      schemeDesignator: 'dicom-microscopy-viewer',
      meaning: 'FREETEXT',
    }),
    value: measurement,
    unit: new dcmjs.sr.coding.CodedConcept({
      value: unit,
      schemeDesignator: 'dicom-microscopy-viewer',
      meaning: 'NUM',
    }),
    qualifier: null, /** Optional if value present */
    relationshipType: 'CONTAINS',
  });
  measurementItem.ContentSequence = new dcmjs.sr.valueTypes.ContentSequence();
  measurementItem.ContentSequence.push(...new dcmjs.sr.templates.TrackingIdentifier({ uid, identifier }));
  measurementItem.ContentSequence.push(
    new dcmjs.sr.contentItems.ImageRegion3D({
      graphicType: scoord3d.graphicType,
      graphicData: scoord3d.graphicData,
      frameOfReferenceUID: scoord3d.frameOfReferenceUID,
    })
  );

  const measurements = [measurementItem];

  return {
    measurements,
    evaluations
  };
};

const MeasurementMarker = api => {
  return {
    addMeasurementsAndEvaluations: (feature, roi) => {
      if (isMeasurement(feature)) {
        const { measurements, evaluations } = getMeasurementsAndEvaluations(feature, roi, api);
        measurements.forEach(measurement => roi.addMeasurement(measurement));
        evaluations.forEach(evaluation => roi.addEvaluation(evaluation));
      }
    },
    onRemove: feature => {
      if (isMeasurement(feature)) {
        const featureId = feature.getId();
        api.markerManager.remove(featureId);
      }
    },
    onAdd: (feature, roi) => {
      if (isMeasurement(feature)) {
        const view = api.map.getView();
        const measurement = formatMeasurement(feature, null, getUnitsSuffix(view));
        api.markerManager.create({ feature, value: measurement });
      }
    },
    onDrawEnd: (feature) => {
      if (isMeasurement(feature)) {
        feature.setStyle(getStyleFunction());
      }
    },
    onUpdate: feature => { },
    onInteractionsChange: interactions => {
      api.markerManager.onInteractionsChange(interactions);
    },
    getDefinition: (options) => {
      const styleFunction = getStyleFunction(options);

      /** Measurement Marker Definition */
      return {
        ...options,
        maxPoints: options.type === 'LineString' ? 1 : undefined,
        minPoints: options.type === 'LineString' ? 1 : undefined,
        style: styleFunction,
        marker: Marker.Measurement,
      };
    },
    isMeasurement,
    format: formatMeasurement,
    style: getStyleFunction
  };
};

export default MeasurementMarker;