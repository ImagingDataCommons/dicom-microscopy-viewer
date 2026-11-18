const testCase = require('../test/data/TCGA-LUAD_TCGA-05-4244-01Z-00-DX1.json')

const dmv = require('./dicom-microscopy-viewer.js')
const { _computeImagePyramid } = require('./pyramid.js')

/**
 * Split the highest resolution image of the fixture into two concatenation
 * parts with the same dimensions.
 */
const buildConcatenatedMetadata = () => {
  const images = testCase.images.map((json) => JSON.parse(JSON.stringify(json)))
  const base = images.reduce((a, b) =>
    a['00480006'].Value[0] >= b['00480006'].Value[0] ? a : b,
  )
  const sourceUID = base['00080018'].Value[0]
  const numberOfFrames = Number(base['00280008'].Value[0])
  const firstPartFrames = Math.floor(numberOfFrames / 2)
  const second = JSON.parse(JSON.stringify(base))
  base['00280008'].Value = [firstPartFrames]
  base['00080018'].Value = [`${sourceUID}.1`]
  base['00200242'] = { vr: 'UI', Value: [sourceUID] }
  base['00209228'] = { vr: 'UL', Value: [0] }
  second['00280008'].Value = [numberOfFrames - firstPartFrames]
  second['00080018'].Value = [`${sourceUID}.2`]
  second['00200242'] = { vr: 'UI', Value: [sourceUID] }
  second['00209228'] = { vr: 'UL', Value: [firstPartFrames] }
  images.push(second)
  return {
    metadata: images.map(
      (json) => new dmv.metadata.VLWholeSlideMicroscopyImage({ metadata: json }),
    ),
    sourceUID,
    numberOfFrames,
  }
}

describe('_computeImagePyramid with concatenations', () => {
  it('merges concatenation parts without mutating the input metadata', () => {
    const { metadata, sourceUID, numberOfFrames } = buildConcatenatedMetadata()
    const before = metadata.map((image) => JSON.stringify(image.json))

    const first = _computeImagePyramid({ metadata: metadata.slice() })
    const second = _computeImagePyramid({ metadata: metadata.slice() })

    const merged = (pyramid) => pyramid.metadata[pyramid.metadata.length - 1]
    expect(merged(first).SOPInstanceUID).toBe(sourceUID)
    expect(Number(merged(first).NumberOfFrames)).toBe(numberOfFrames)
    expect(Number(merged(second).NumberOfFrames)).toBe(numberOfFrames)
    expect(metadata.map((image) => JSON.stringify(image.json))).toEqual(before)
  })
})
