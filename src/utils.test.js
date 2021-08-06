const utils = require('./utils')

const computeRotationParams = [
  {
    inputs: {
      orientation: [0, 1, 0, 1, 0, 0],
      inDegrees: true
    },
    expectedOutput: -90
  },
  {
    inputs: {
      orientation: [0, -1, 0, -1, 0, 0],
      inDegrees: true
    },
    expectedOutput: 90
  },
  {
    inputs: {
      orientation: [1, 0, 0, 0, -1, 0],
      inDegrees: true
    },
    expectedOutput: -0
  },
  {
    inputs: {
      orientation: [-1, 0, 0, 0, 1, 0],
      inDegrees: true
    },
    expectedOutput: -180
  }
]

const mapPixelCoordToSlideCoordParams = [
  {
    inputs: {
      point: [0.0, 0.0],
      offset: [0.0, 0.0],
      orientation: [0.0, 1.0, 0.0, 1.0, 0.0, 0.0],
      spacing: [1.0, 1.0]
    },
    expectedOutput: [0.0, 0.0]
  },
  {
    inputs: {
      point: [0.0, 0.0],
      offset: [0.0, 0.0],
      orientation: [0.0, 1.0, 0.0, 1.0, 0.0, 0.0],
      spacing: [1.0, 1.0]
    },
    expectedOutput: [0.0, 0.0]
  },
  {
    inputs: {
      point: [0.0, 0.0],
      offset: [1.0, 1.0],
      orientation: [0.0, 1.0, 0.0, 1.0, 0.0, 0.0],
      spacing: [1.0, 1.0]
    },
    expectedOutput: [1.0, 1.0]
  },
  {
    inputs: {
      point: [0.0, 0.0],
      offset: [1.0, 1.0],
      orientation: [0.0, 1.0, 0.0, 1.0, 0.0, 0.0],
      spacing: [1.0, 1.0]
    },
    expectedOutput: [1.0, 1.0]
  },
  {
    inputs: {
      point: [1.0, 1.0],
      offset: [1.0, 1.0],
      orientation: [0.0, 1.0, 0.0, 1.0, 0.0, 0.0],
      spacing: [1.0, 1.0]
    },
    expectedOutput: [2.0, 2.0]
  },
  {
    inputs: {
      point: [1.0, 1.0],
      offset: [10.0, 60.0],
      orientation: [0.0, 1.0, 0.0, 1.0, 0.0, 0.0],
      spacing: [0.5, 0.5]
    },
    expectedOutput: [10.5, 60.5]
  },
  {
    inputs: {
      point: [5.0, 2.0],
      offset: [10.0, 60.0],
      orientation: [0.0, 1.0, 0.0, 1.0, 0.0, 0.0],
      spacing: [2.0, 0.5]
    },
    expectedOutput: [14.0, 62.5]
  },
  {
    inputs: {
      point: [5.0, 2.0],
      offset: [10.0, 60.0],
      orientation: [0.0, -1.0, 0.0, -1.0, 0.0, 0.0],
      spacing: [2.0, 0.5]
    },
    expectedOutput: [6.0, 57.5]
  },
  {
    inputs: {
      point: [2.0, 2.0],
      offset: [10.0, 60.0],
      orientation: [0.0, -1.0, 0.0, -1.0, 0.0, 0.0],
      spacing: [2.0, 0.5]
    },
    expectedOutput: [6.0, 59.0]
  },
  {
    inputs: {
      point: [2.0, 4.0],
      offset: [10.0, 60.0],
      orientation: [0.0, -1.0, 0.0, -1.0, 0.0, 0.0],
      spacing: [2.0, 0.5]
    },
    expectedOutput: [2.0, 59.0]
  },
  {
    inputs: {
      point: [5.0, 2.0],
      offset: [10.0, 60.0],
      orientation: [1.0, 0.0, 0.0, 0.0, -1.0, 0.0],
      spacing: [2.0, 0.5]
    },
    expectedOutput: [12.5, 56.0]
  },
  {
    inputs: {
      point: [5.0, 4.0],
      offset: [10.0, 60.0],
      orientation: [1.0, 0.0, 0.0, 0.0, -1.0, 0.0],
      spacing: [2.0, 0.5]
    },
    expectedOutput: [12.5, 52.0]
  },
  {
    inputs: {
      point: [5.0, 4.0],
      offset: [10.0, 60.0],
      orientation: [1.0, 0.0, 0.0, 0.0, -1.0, 0.0],
      spacing: [2.0, 0.5]
    },
    expectedOutput: [12.5, 52.0]
  }
]

const mapSlideCoordToPixelCoordParams = [
  {
    inputs: {
      point: [0.0, 0.0],
      offset: [0.0, 0.0],
      orientation: [0.0, 1.0, 0.0, 1.0, 0.0, 0.0],
      spacing: [1.0, 1.0]
    },
    expectedOutput: [0.0, 0.0]
  },
  {
    inputs: {
      point: [0.0, 0.0],
      offset: [0.0, 0.0],
      orientation: [0.0, 1.0, 0.0, 1.0, 0.0, 0.0],
      spacing: [1.0, 1.0]
    },
    expectedOutput: [0.0, 0.0]
  },
  {
    inputs: {
      point: [1.0, 1.0],
      offset: [1.0, 1.0],
      orientation: [0.0, 1.0, 0.0, 1.0, 0.0, 0.0],
      spacing: [1.0, 1.0]
    },
    expectedOutput: [0.0, 0.0]
  },
  {
    inputs: {
      point: [1.0, 1.0],
      offset: [1.0, 1.0],
      orientation: [0.0, 1.0, 0.0, 1.0, 0.0, 0.0],
      spacing: [1.0, 1.0]
    },
    expectedOutput: [0.0, 0.0]
  },
  {
    inputs: {
      point: [2.0, 2.0],
      offset: [1.0, 1.0],
      orientation: [0.0, 1.0, 0.0, 1.0, 0.0, 0.0],
      spacing: [1.0, 1.0]
    },
    expectedOutput: [1.0, 1.0]
  },
  {
    inputs: {
      point: [10.5, 60.5],
      offset: [10.0, 60.0],
      orientation: [0.0, 1.0, 0.0, 1.0, 0.0, 0.0],
      spacing: [0.5, 0.5]
    },
    expectedOutput: [1.0, 1.0]
  },
  {
    inputs: {
      point: [14.0, 62.5],
      offset: [10.0, 60.0],
      orientation: [0.0, 1.0, 0.0, 1.0, 0.0, 0.0],
      spacing: [2.0, 0.5]
    },
    expectedOutput: [5.0, 2.0]
  },
  {
    inputs: {
      point: [6.0, 57.5],
      offset: [10.0, 60.0],
      orientation: [0.0, -1.0, 0.0, -1.0, 0.0, 0.0],
      spacing: [2.0, 0.5]
    },
    expectedOutput: [5.0, 2.0]
  },
  {
    inputs: {
      point: [6.0, 59.0],
      offset: [10.0, 60.0],
      orientation: [0.0, -1.0, 0.0, -1.0, 0.0, 0.0],
      spacing: [2.0, 0.5]
    },
    expectedOutput: [2.0, 2.0]
  },
  {
    inputs: {
      point: [2.0, 59.0],
      offset: [10.0, 60.0],
      orientation: [0.0, -1.0, 0.0, -1.0, 0.0, 0.0],
      spacing: [2.0, 0.5]
    },
    expectedOutput: [2.0, 4.0]
  },
  {
    inputs: {
      point: [12.5, 56.0],
      offset: [10.0, 60.0],
      orientation: [1.0, 0.0, 0.0, 0.0, -1.0, 0.0],
      spacing: [2.0, 0.5]
    },
    expectedOutput: [5.0, 2.0]
  },
  {
    inputs: {
      point: [12.5, 52.0],
      offset: [10.0, 60.0],
      orientation: [1.0, 0.0, 0.0, 0.0, -1.0, 0.0],
      spacing: [2.0, 0.5]
    },
    expectedOutput: [5.0, 4.0]
  },
  {
    inputs: {
      point: [12.5, 52.0],
      offset: [10.0, 60.0],
      orientation: [1.0, 0.0, 0.0, 0.0, -1.0, 0.0],
      spacing: [2.0, 0.5]
    },
    expectedOutput: [5.0, 4.0]
  }
]

describe('utils.computeRotation', () => {
  computeRotationParams.forEach(params => {
    it('should compute correct rotation angle', () => {
      const output = utils.computeRotation(params.inputs)
      expect(output).toEqual(params.expectedOutput)
    })
  })
})

describe('utils.mapPixelCoordToSlideCoord', () => {
  mapPixelCoordToSlideCoordParams.forEach(params => {
    it('should map pixel point to slide point', () => {
      const output = utils.mapPixelCoordToSlideCoord(params.inputs)
      expect(output).toEqual(params.expectedOutput)
    })
  })
})

describe('utils.mapSlideCoordToPixelCoord', () => {
  mapSlideCoordToPixelCoordParams.forEach(params => {
    it('should map slide point to pixel point', () => {
      const output = utils.mapSlideCoordToPixelCoord(params.inputs)
      expect(output).toEqual(params.expectedOutput)
    })
  })
})
