export const getCurrentStyle = (feature) => {
  const style = feature.getStyle()
  if (typeof style === 'function') {
    const resolution = null
    return style(feature, resolution)
  } else {
    return style
  }
}
