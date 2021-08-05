import testCase1 from '../test/data/testMultiChannel1.json'
import testCase2 from '../test/data/testMultiChannel2.json'
import testCase3 from '../test/data/testMultiChannel3.json'

const dmv = require('./dicom-microscopy-viewer.js')

jest.mock('./renderingEngine')

describe('dmv.viewer.VolumeImageViewer', () => {
  let BIOne, BITwo, BIThree, viewer, metadata

  beforeAll(() => {
    metadata = [testCase1[0], testCase2[0], testCase3[0]]
    BIOne = new dmv.metadata.BlendingInformation({
      opticalPathIdentifier: '1',
      color: [0.0, 0.5, 0.5],
      opacity: 1.0,
      thresholdValues: [125.0, 255.0],
      limitValues: [0.0, 255.0],
      visible: true
    })
    BITwo = new dmv.metadata.BlendingInformation({
      opticalPathIdentifier: '2',
      color: [0.5, 0.5, 0.0],
      opacity: 1.0,
      thresholdValues: [0.0, 255.0],
      limitValues: [0.0, 255.0],
      visible: true
    })
    BIThree = new dmv.metadata.BlendingInformation({
      opticalPathIdentifier: '3',
      color: [1, 0.0, 0.0],
      opacity: 1.0,
      thresholdValues: [0.0, 255.0],
      limitValues: [0.0, 255.0],
      visible: true
    })
    viewer = new dmv.api.VLWholeSlideMicroscopyImageViewer({
      client: 'test',
      metadata,
      blendingInformation: [BIOne, BITwo, BIThree]
    })
  })

  it('sets optical path color', () => {
    const color = [1.0, 0.0, 0.0]
    const blendingInformation = {
      color: color,
      opticalPathIdentifier: '1'
    }
    viewer.setBlendingInformation(blendingInformation)
    expect(color).toEqual(viewer.getBlendingInformation(blendingInformation.opticalPathIdentifier).color)
  })

  it('sets optical path thresholdValues', () => {
    const thresholdValues = [0.0, 255.0]
    const blendingInformation = {
      thresholdValues: thresholdValues,
      opticalPathIdentifier: '1'
    }

    viewer.setBlendingInformation(blendingInformation)
    const retrievedBlendingInformation = viewer.getBlendingInformation(
      blendingInformation.opticalPathIdentifier
    )
    expect(thresholdValues).toEqual(retrievedBlendingInformation.thresholdValues)
  })

  it('sets optical path opacity', () => {
    const opacity = 0.5
    const blendingInformation = {
      opacity: opacity,
      opticalPathIdentifier: '1'
    }

    viewer.setBlendingInformation(blendingInformation)
    const retrievedBlendingInformation = viewer.getBlendingInformation(
      blendingInformation.opticalPathIdentifier
    )
    expect(opacity).toEqual(retrievedBlendingInformation.opacity)
  })

  it('hides optical path', () => {
    const opticalPathIdentifier = '1'

    viewer.hideOpticalPath(opticalPathIdentifier)
    const blendingInformation = viewer.getBlendingInformation(opticalPathIdentifier)
    expect(false).toEqual(blendingInformation.visible)
  })

  it('shows optical path', () => {
    const opticalPathIdentifier = '1'

    viewer.showOpticalPath(opticalPathIdentifier)
    const blendingInformation = viewer.getBlendingInformation(opticalPathIdentifier)
    expect(true).toEqual(blendingInformation.visible)
  })

  it('throws an Error if activates optical path identifier 4', () => {
    const opticalPathIdentifier = '4'

    expect(() => {
      viewer.activateOpticalPath(opticalPathIdentifier)
    }).toThrow(
      'No OpticalPath with ID ' + opticalPathIdentifier + ' has been found.'
    )
  })

  it('throws an Error if deactivates optical path identifier 4', () => {
    const opticalPathIdentifier = '4'

    expect(() => {
      viewer.deactivateOpticalPath(opticalPathIdentifier)
    }).toThrow(
      'No OpticalPath with ID ' + opticalPathIdentifier + ' has been found.'
    )
  })

  it('throws an Error if activates optical path identifier 3 (already activated)', () => {
    const opticalPathIdentifier = '3'

    expect(() => {
      viewer.activateOpticalPath(opticalPathIdentifier)
    }).toThrow(
      'OpticalPath ' + opticalPathIdentifier + ' already activated'
    )
  })

  it('throws an Error if deactivates optical path identifier 3 twice', () => {
    const opticalPathIdentifier = '3'
    viewer.deactivateOpticalPath(opticalPathIdentifier)

    expect(() => viewer.deactivateOpticalPath(opticalPathIdentifier)).toThrow('OpticalPath ' + opticalPathIdentifier + ' already deactivated')
  })
})
