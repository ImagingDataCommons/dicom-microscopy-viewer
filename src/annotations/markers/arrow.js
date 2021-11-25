import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Point from 'ol/geom/Point'
import LineString from 'ol/geom/LineString'
import Icon from 'ol/style/Icon'

import Enums from '../../enums'
import defaultStyles from '../styles'
import annotationInterface from '../annotationInterface'

/**
 * Format arrow output.
 *
 * @param {LineString} arrow geometry
 * @return {string} The formatted output
 */
export const format = (feature) =>
  feature.get(Enums.InternalProperties.Label) || ''

/**
 * Builds arrow styles.
 *
 * @param {object} feature The feature instance
 * @param {object} map The viewer map instance
 * @returns {object} Style instance
 */
const _applyStyles = (feature, map) => {
  const geometry = feature.getGeometry()
  if (geometry instanceof Point || geometry instanceof LineString) {
    const anchor = [0, 0.5]
    const rotation = 120
    const point = geometry.getCoordinates()
    const styleOptions = feature.get(Enums.InternalProperties.StyleOptions)
    const color =
      styleOptions && styleOptions.stroke && styleOptions.stroke.color
        ? styleOptions.stroke.color
        : defaultStyles.stroke.color

    feature.setStyle((feature, resolution) => {
      const view = map.getView()
      const currentZoomLevel = view.getZoom()
      const zoomResolution = view.getResolutionForZoom(currentZoomLevel)
      const newScale = zoomResolution / resolution

      const pointIcon = `
          <svg version="1.1" width="70px" height="70px" viewBox="0 -7.101 760.428 415.101" style="enable-background:new 0 0 408 408;" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path style="fill:${encodeURIComponent(
                color
              )};" d="M 736.978 175.952 L 96.9 178.5 L 239.7 35.7 L 204 0 L 0 204 L 204 408 L 239.7 372.3 L 96.9 229.5 L 737.197 224.191 L 736.978 175.952 Z"/>
            </g>
          </svg>
        `

      const icon = `
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="70px" height="70px" viewBox="0 0 407.436 407.436" style="enable-background:new 0 0 407.436 407.436;">
          <polygon style="fill:${encodeURIComponent(
            color
          )};" points="315.869,21.178 294.621,0 91.566,203.718 294.621,407.436 315.869,386.258 133.924,203.718 "/>
        </svg>
      `

      const styles = []

      if (geometry instanceof LineString) {
        geometry.forEachSegment((start, end) => {
          const dx = end[0] - start[0]
          const dy = end[1] - start[1]
          const rotation = Math.atan2(dy, dx)

          const arrowStyle = new Style({
            geometry: new Point(start),
            image: new Icon({
              opacity: 1,
              src: `data:image/svg+xml;utf8,${icon}`,
              scale: newScale /** Absolute-sized icon */,
              anchor: [0.3, 0.5],
              rotateWithView: true,
              rotation: -rotation
            })
          })

          styles.push(
            new Style({
              stroke: new Stroke({
                color,
                width: 5 * newScale /** Keep scale sync with icon */
              })
            })
          )

          /** Arrow */
          styles.push(arrowStyle)
        })

        return styles
      }

      const iconStyle = new Style({
        geometry: new Point(point),
        image: new Icon({
          opacity: 1,
          src: `data:image/svg+xml;utf8,${pointIcon}`,
          scale: newScale /** Absolute-sized icon */,
          anchor,
          rotateWithView: true,
          rotation: -rotation
        })
      })

      return iconStyle
    })
  }
}

const _isArrow = (feature) =>
  Enums.Marker.Arrow === feature.get(Enums.InternalProperties.Marker)

/**
 * Arrow marker definition.
 *
 * @param {object} dependencies Shared dependencies
 * @param {object} dependencies.map Map shared instance
 * @param {object} dependencies.markupManager Markup manager shared instance
 */
const ArrowMarker = ({ map, markupManager }) => {
  return Object.assign({}, annotationInterface, {
    onAdd: (feature) => {
      if (_isArrow(feature)) {
        _applyStyles(feature, map)

        /** Keep arrow style after external style changes */
        feature.on(
          Enums.FeatureEvents.PROPERTY_CHANGE,
          ({ key: property, target: feature }) => {
            if (property === Enums.InternalProperties.StyleOptions) {
              _applyStyles(feature, map)
            }
          }
        )

        /** Update arrow icon position on feature geometry change */
        feature.getGeometry().on(Enums.FeatureGeometryEvents.CHANGE, () => {
          _applyStyles(feature, map)
        })
      }
    },
    onDrawStart: ({ feature }) => {
      if (_isArrow(feature)) {
        _applyStyles(feature, map)
      }
    },
    onRemove: (feature) => {
      if (_isArrow(feature)) {
        const featureId = feature.getId()
        markupManager.remove(featureId)
      }
    },
    onFailure: (uid) => {
      if (uid) {
        markupManager.remove(uid)
      }
    },
  })
}

export default ArrowMarker
