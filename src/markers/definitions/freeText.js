import Style from 'ol/style/Style';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';
import dcmjs from 'dcmjs';

import { Marker } from '../enums';

export const isFreeText = feature => Marker.FreeText === feature.get('marker');

const getStyleFunction = options => {
  return (feature, resolution) => {
    const styles = [];

    if (isFreeText(feature)) {
      styles.push(
        new Style({
          text: new Text({
            font: '14px sans-serif',
            overflow: true,
            fill: new Fill({ color: '#9ccef9' }),
            text: feature.get('label')
          })
        })
      );

      styles.push(
        new Style({
          image: new Circle({
            fill: new Fill({ color: 'rgba(255,255,255,0.0)' }),
            stroke: new Stroke({
              color: 'rgba(255,255,255,0.0)',
              width: 0,
            }),
            radius: 15,
          })
        })
      );
    }

    return styles;
  };
};

const getDefinition = options => {
  const styleFunction = getStyleFunction(options);

  /** FreeText Marker Definition */
  return {
    ...options,
    style: styleFunction,
    marker: Marker.FreeText,
  };
};

/**
 * Format free text output
 * @param {Feature} feature feature
 * @return {string} The formatted output
 */
const formatFreeText = (feature, geometry) => {
  const properties = feature.getProperties();
  return properties.label || '';
};

const getMeasurementsAndEvaluations = (feature, roi, api) => {
  const evaluations = [
    new dcmjs.sr.valueTypes.CodeContentItem({
      name: new dcmjs.sr.coding.CodedConcept({
        value: "marker",
        meaning: "Marker Identification",
        schemeDesignator: "dicom-microscopy-viewer"
      }),
      value: new dcmjs.sr.coding.CodedConcept({
        value: Marker.FreeText,
        meaning: "Marker Type",
        schemeDesignator: "dicom-microscopy-viewer"
      }),
      relationshipType: 'HAS CONCEPT MOD'
    }),
    new dcmjs.sr.valueTypes.CodeContentItem({
      name: new dcmjs.sr.coding.CodedConcept({
        value: "label",
        meaning: "Marker Label",
        schemeDesignator: "dicom-microscopy-viewer"
      }),
      value: new dcmjs.sr.coding.CodedConcept({
        value: feature.get('label') || '',
        meaning: "Marker Label",
        schemeDesignator: "dicom-microscopy-viewer"
      }),
      relationshipType: 'HAS CONCEPT MOD'
    }),
  ];

  return {
    measurements: [],
    evaluations
  };
};

const FreeTextMarker = api => {
  return {
    addMeasurementsAndEvaluations: (feature, roi) => {
      if (isFreeText(feature)) {
        const { measurements, evaluations } = getMeasurementsAndEvaluations(feature, roi, api);
        measurements.forEach(measurement => roi.addMeasurement(measurement));
        evaluations.forEach(evaluation => roi.addEvaluation(evaluation));
      }
    },
    onAdd: (feature, roi) => {
      if (isFreeText(feature)) {
        feature.setStyle(getStyleFunction(roi.properties));
      }
    },
    onUpdate: feature => {
      if (isFreeText(feature)) {
        /** Refresh to get latest value of label property */
        feature.changed();
      }
    },
    onDrawEnd: (feature) => {
      if (isFreeText(feature)) {
        feature.setStyle(getStyleFunction());
      }
    },
    onRemove: feature => { },
    onInteractionsChange: () => { },
    getDefinition,
    isFreeText,
    format: formatFreeText,
    style: getStyleFunction,
  };
};

export default FreeTextMarker;