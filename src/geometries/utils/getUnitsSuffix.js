import { getPointResolution } from 'ol/proj';

const UnitsEnum = { METERS: 'm' };
const DEFAULT_DPI = 25.4 / 0.28;

const getUnitsSuffix = (view) => {
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
  const minWidth = (DEFAULT_MIN_WIDTH * (DEFAULT_DPI)) / DEFAULT_DPI;

  let nominalCount = minWidth * pointResolution;
  let suffix = '';

  if (nominalCount < 0.001) {
    suffix = 'μm';
    pointResolution *= 1000000;
  } else if (nominalCount < 1) {
    suffix = 'mm';
    pointResolution *= 1000;
  } else if (nominalCount < 1000) {
    suffix = 'm';
  } else {
    suffix = 'km';
    pointResolution /= 1000;
  }

  return suffix;
};

export default getUnitsSuffix;