import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style.js'
import { createEmpty, extend, getHeight, getWidth } from 'ol/extent.js'

const textFill = new Fill({ color: '#fff' })
const textStroke = new Stroke({
  color: 'rgba(0, 0, 0, 0.6)',
  width: 3,
})
const CIRCLE_RADIUS = 14

/**
 * Single feature style, users for clusters with 1 feature and cluster circles.
 * @param {Feature} clusterMember A feature from a cluster.
 * @return {Style} An icon style for the cluster member's location.
 */
export function clusterMemberStyle(clusterMember) {
  return new Style({ geometry: clusterMember.getGeometry() })
}

const outerCircleFill = new Fill()
const innerCircleFill = new Fill()
const innerCircle = new CircleStyle({
  radius: CIRCLE_RADIUS,
  fill: innerCircleFill,
})
const outerCircle = new CircleStyle({ fill: outerCircleFill })
const outerCircleStyle = new Style({ image: outerCircle })
const textStyle = new Text({
  fill: textFill,
  stroke: textStroke,
})
const innerCircleStyle = new Style({
  image: innerCircle,
  text: textStyle,
})

export function getClusterStyleFunc({ color, opacity }, clusterSource) {
  outerCircleFill.setColor(`rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`)
  innerCircleFill.setColor(
    `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`,
  )
  innerCircle.setFill(innerCircleFill)

  const updateClustersRadius = (resolution) => {
    const features = clusterSource.getFeatures()

    for (let i = features.length - 1; i >= 0; --i) {
      const feature = features[i]
      const originalFeatures = feature.get('features')
      const extent = createEmpty()

      let j, jj
      for (j = 0, jj = originalFeatures.length; j < jj; ++j) {
        extend(extent, originalFeatures[j].getGeometry().getExtent())
      }

      const radius =
        (0.15 * (getWidth(extent) + getHeight(extent))) / resolution
      feature.set('radius', radius)
    }
  }

  /** Style Function */
  let currentResolution
  return (feature, resolution) => {
    const features = feature.get('features')

    if (resolution !== currentResolution) {
      updateClustersRadius(resolution)
      currentResolution = resolution
    }

    const size = features.length
    if (size > 0) {
      outerCircle.setRadius(feature.get('radius'))
      outerCircleStyle.setImage(outerCircle)
      textStyle.setText(size.toString())
      return [outerCircleStyle, innerCircleStyle]
    }

    const originalFeature = features[0]
    return clusterMemberStyle(originalFeature)
  }
}
