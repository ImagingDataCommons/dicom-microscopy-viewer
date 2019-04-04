import {Fill, Stroke, Style as OpenLayersStyle, Circle as CircleStyle} from 'ol/style.js';

const _style = Symbol('style')

class ToolStyle {  
  
    constructor(strokeOptions, fillOptions, circleOptions, textOptions) {

      const style = new OpenLayersStyle({
        stroke: new Stroke({
          color: strokeOptions.color,
          width: strokeOptions.width
        }),
        fill: new Fill({
          color: fillOptions.color
        }),
        image: new CircleStyle({
          radius: circleOptions.radius,
          fill: new Fill({
            color: circleOptions.color
          })
        })
      })

      this[_style] = style

    }

    getStyle(){
      return this[_style]
    }
  
  }

export { ToolStyle };