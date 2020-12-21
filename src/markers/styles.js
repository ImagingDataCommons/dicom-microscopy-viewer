import Fill from 'ol/style/Fill';
import Circle from 'ol/style/Circle';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';

const emptyFill = new Fill({
  color: 'rgba(255,255,255,0.0)',
});

const defaultStroke = new Stroke({
  color: '#3399CC',
  width: 3,
});

const defaultStyle = new Style({
  image: new Circle({
    fill: emptyFill,
    stroke: defaultStroke,
    radius: 5,
  }),
  fill: emptyFill,
  stroke: defaultStroke,
});

export default { defaultStyle, defaultStroke };
export { defaultStyle, defaultStroke }