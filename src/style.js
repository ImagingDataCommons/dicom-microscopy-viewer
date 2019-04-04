import {Fill, Stroke, Text, Style as OpenLayersStyle, Circle as CircleStyle} from 'ol/style.js';

const _style = Symbol('style')

class ToolStyle {  
  
    constructor(styleOptions) {

      const style = new OpenLayersStyle({
        stroke: new Stroke({
          color: styleOptions.stroke.color !== undefined ? styleOptions.stroke.color : 'green',
          width: styleOptions.stroke.width !== undefined ? styleOptions.stroke.width : 1
        }),
        fill: new Fill({
          color: styleOptions.fill.color !== undefined ? styleOptions.fill.color : 'rgba(0, 255, 0, 0.1)'
        }),
        image: new CircleStyle({
          radius: styleOptions.circle.radius !== undefined ? styleOptions.circle.radius : 5,
          fill: new Fill({
            color: styleOptions.circle.color !== undefined ? styleOptions.circle.color : 'green'
          })
        }),
        text : styleOptions.text !== undefined ? new Text({
          font: '10px sans-serif',
          textAlign : 'center',  
          text : 'teste',
          offsetX : 0,
          offsetY : 0,
          scale : 1,
          textBaseline : 'center',
          fill : new Fill({
            color: '#333'
          })
        }) : new Text()
      })

      this[_style] = style

    }

    getStyle(){
      return this[_style]
    }
  
  }

export { ToolStyle };