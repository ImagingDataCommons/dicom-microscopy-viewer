import Feature from "ol/Feature.js"
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from "ol/style.js"
import { createEmpty, extend, getHeight, getWidth } from 'ol/extent.js';

const circleDistanceMultiplier = 1
const circleFootSeparation = 28
const circleStartAngle = Math.PI / 2
const textFill = new Fill({
  color: "#fff",
})
const textStroke = new Stroke({
  color: "rgba(0, 0, 0, 0.6)",
  width: 3,
})

/**
 * Single feature style, users for clusters with 1 feature and cluster circles.
 * @param {Feature} clusterMember A feature from a cluster.
 * @return {Style} An icon style for the cluster member's location.
 */
export function clusterMemberStyle(clusterMember) {
  return new Style({
    geometry: clusterMember.getGeometry(),
  })
}

/**
 * From
 * https://github.com/Leaflet/Leaflet.markercluster/blob/31360f2/src/MarkerCluster.Spiderfier.js#L55-L72
 * Arranges points in a circle around the cluster center, with a line pointing from the center to
 * each point.
 * @param {number} count Number of cluster members.
 * @param {Array<number>} clusterCenter Center coordinate of the cluster.
 * @param {number} resolution Current view resolution.
 * @return {Array<Array<number>>} An array of coordinates representing the cluster members.
 */
export function generatePointsCircle(count, clusterCenter, resolution) {
  const circumference =
    circleDistanceMultiplier * circleFootSeparation * (2 + count)
  let legLength = circumference / (Math.PI * 2) //radius from circumference
  const angleStep = (Math.PI * 2) / count
  const res = []
  let angle

  legLength = Math.max(legLength, 35) * resolution // Minimum distance to get outside the cluster icon.

  for (let i = 0; i < count; ++i) {
    // Clockwise, like spiral.
    angle = circleStartAngle + i * angleStep
    res.push([
      clusterCenter[0] + legLength * Math.cos(angle),
      clusterCenter[1] + legLength * Math.sin(angle),
    ])
  }

  return res
}

export function getClusterStyleFunc({ color, opacity }, clusterSource) {
  const outerCircleFill = new Fill({
    color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`,
  })
  const innerCircleFill = new Fill({
    color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`,
  })

  let maxFeatureCount, currentResolution;

  const calculateClusterInfo = function (resolution) {
    maxFeatureCount = 0;
    const features = clusterSource.getFeatures();
    let feature, radius;
    for (let i = features.length - 1; i >= 0; --i) {
      feature = features[i];
      const originalFeatures = feature.get('features');
      const extent = createEmpty();
      let j, jj;
      for (j = 0, jj = originalFeatures.length; j < jj; ++j) {
        extend(extent, originalFeatures[j].getGeometry().getExtent());
      }
      maxFeatureCount = Math.max(maxFeatureCount, jj);
      radius = (0.15 * (getWidth(extent) + getHeight(extent))) / resolution;
      feature.set('radius', radius);
    }
  };

  /** Style Function */
  return (feature, resolution) => {
    if (resolution != currentResolution) {
      calculateClusterInfo(resolution);
      currentResolution = resolution;
    }

    const size = feature.get("features").length
    if (size > 0) {
      const innerCircle = new CircleStyle({
        radius: 14,
        fill: innerCircleFill,
      })
      const outerCircle = new CircleStyle({
        radius: feature.get('radius'),
        fill: outerCircleFill,
      })

      return [
        new Style({ image: outerCircle }),
        new Style({
          image: innerCircle,
          text: new Text({
            text: size.toString(),
            fill: textFill,
            stroke: textStroke,
          }),
        }),
      ]
    }
    const originalFeature = feature.get("features")[0]
    return clusterMemberStyle(originalFeature)
  };
}
