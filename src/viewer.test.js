const testCase1 = require('../test/data/testCase1.json')
const testCase2 = require('../test/data/testCase2.json')
const testCase3 = require('../test/data/testCase3.json')
const testCases = [testCase1, testCase2, testCase3]

const dmv = require('./dicom-microscopy-viewer.js')

jest.mock('./renderingEngine')

describe('dmv.viewer.VolumeImageViewer', () => {
  let viewer
  testCases.forEach((metadata, index) => {
    console.log(`run test case #${index + 1}`)
    beforeAll(() => {
      viewer = new dmv.api.VLWholeSlideMicroscopyImageViewer({
        client: 'test',
        metadata: metadata
      })
    })

    const ellipse = new dmv.scoord3d.Ellipse({
      coordinates: [
        [8.0, 9.2, 0],
        [8.8, 9.2, 0],
        [8.2, 9.0, 0],
        [8.2, 9.4, 0]
      ],
      frameOfReferenceUID: '1.2.3'
    })
    const point = new dmv.scoord3d.Point({
      coordinates: [9.0467, 8.7631, 0],
      frameOfReferenceUID: '1.2.3'
    })
    const box = new dmv.scoord3d.Polygon({
      coordinates: [
        [8.8824, 8.8684, 0],
        [9.2255, 9.9634, 0],
        [10.3205, 9.6203, 0],
        [9.9774, 8.5253, 0],
        [8.8824, 8.8684, 0]
      ],
      frameOfReferenceUID: '1.2.3'
    })
    const polygon = new dmv.scoord3d.Polygon({
      coordinates: [
        [7.8326, 8.4428, 0],
        [7.1919, 7.9169, 0],
        [8.7772, 7.2831, 0],
        [7.8326, 8.4428, 0]
      ],
      frameOfReferenceUID: '1.2.3'
    })
    const freehandPolygon = new dmv.scoord3d.Polygon({
      coordinates: [
        [6.9340, 7.0669, 0],
        [6.9340, 7.0669, 0],
        [6.9189, 7.0216, 0],
        [6.9114, 6.9973, 0],
        [6.9114, 6.9797, 0],
        [6.9139, 6.9621, 0],
        [6.9216, 6.9470, 0],
        [6.9292, 6.9344, 0],
        [6.9419, 6.9294, 0],
        [6.9496, 6.9269, 0],
        [6.9597, 6.9243, 0],
        [6.9674, 6.9243, 0],
        [6.9674, 6.9243, 0],
        [6.9340, 7.0669, 0]
      ],
      frameOfReferenceUID: '1.2.3'
    })
    const line = new dmv.scoord3d.Polyline({
      coordinates: [
        [7.0442, 7.5295, 0],
        [7.6725, 7.0580, 0]
      ],
      frameOfReferenceUID: '1.2.3'
    })
    const freeHandLine = new dmv.scoord3d.Polyline({
      coordinates: [
        [6.6769, 9.1169, 0],
        [6.6769, 9.1169, 0],
        [6.6668, 9.1119, 0],
        [6.6567, 9.1043, 0],
        [6.6366, 9.0817, 0],
        [6.6182, 9.0423, 0],
        [6.6182, 9.0322, 0],
        [6.6182, 9.0197, 0],
        [6.6233, 9.0096, 0],
        [6.6258, 9.0020, 0],
        [6.6284, 8.9995, 0],
        [6.6334, 8.9945, 0],
        [6.6360, 8.9945, 0]
      ],
      frameOfReferenceUID: '1.2.3'
    })

    it('should return [] if there is no drawing', () => {
      expect(viewer.getAllROIs()).toEqual([])
    })

    it('should add property to ROI upon construction', () => {
      const roi = new dmv.roi.ROI({
        scoord3d: point,
        properties: { foo: 'bar' }
      })
      expect(roi.properties).toEqual(
        {
          foo: 'bar',
          measurements: [],
          evaluations: []
        }
      )
      expect(roi.measurements).toEqual([])
      expect(roi.evaluations).toEqual([])
    })

    it('should add evaluation to ROI upon construction', () => {
      const evaluation = {
        ConceptNameCodeSequence: [{
          CodeValue: '121071',
          CodeMeaning: 'Finding',
          CodingSchemeDesignator: 'DCM'
        }],
        ConceptCodeSequence: [{
          CodeValue: '108369006',
          CodingSchemeDesignator: 'SCT',
          CodeMeaning: 'Tumor'
        }],
        ValueType: 'CODE'
      }
      const roi = new dmv.roi.ROI({
        scoord3d: point,
        properties: {
          evaluations: [evaluation]
        }
      })
      expect(roi.properties).toEqual(
        {
          measurements: [],
          evaluations: [evaluation]
        }
      )
      expect(roi.measurements).toEqual([])
      expect(roi.evaluations).toEqual([evaluation])
    })

    it('should add property to ROI upon construction', () => {
      const roi = new dmv.roi.ROI({ scoord3d: point })
      expect(roi.properties).toEqual(
        {
          measurements: [],
          evaluations: []
        }
      )
      expect(roi.measurements).toEqual([])
      expect(roi.evaluations).toEqual([])
    })
    it('should add evaluation to ROI upon construction', () => {
      const evaluation = {
        ConceptNameCodeSequence: [{
          CodeValue: '121071',
          CodeMeaning: 'Finding',
          CodingSchemeDesignator: 'DCM'
        }],
        ConceptCodeSequence: [{
          CodeValue: '108369006',
          CodingSchemeDesignator: 'SCT',
          CodeMeaning: 'Tumor'
        }],
        ValueType: 'CODE'
      }
      const roi = new dmv.roi.ROI({
        scoord3d: point,
        properties: {
          evaluations: [evaluation]
        }
      })
      expect(roi.properties).toEqual(
        {
          measurements: [],
          evaluations: [evaluation]
        }
      )
      expect(roi.measurements).toEqual([])
      expect(roi.evaluations).toEqual([evaluation])
    })

    it('should add measurement to ROI upon construction', () => {
      const measurement = {
        ConceptNameCodeSequence: [{
          CodeValue: '410668003',
          CodeMeaning: 'Length',
          CodingSchemeDesignator: 'DCM'
        }],
        MeasuredValueSequence: [{
          MeasurementUnitsCodeSequence: [{
            CodeValue: 'mm',
            CodeMeaning: 'millimeter',
            CodingSchemeDesignator: 'UCUM'
          }],
          NumericValue: 5
        }],
        ValueType: 'CODE'
      }
      const roi = new dmv.roi.ROI({
        scoord3d: point,
        properties: { measurements: [measurement] }
      })
      expect(roi.properties).toEqual(
        {
          measurements: [measurement],
          evaluations: []
        }
      )
      expect(roi.measurements).toEqual([measurement])
      expect(roi.evaluations).toEqual([])
    })

    it('should add measurement to ROI after construction', () => {
      const measurement = {
        ConceptNameCodeSequence: [{
          CodeValue: '410668003',
          CodeMeaning: 'Length',
          CodingSchemeDesignator: 'DCM'
        }],
        MeasuredValueSequence: [{
          MeasurementUnitsCodeSequence: [{
            CodeValue: 'mm',
            CodeMeaning: 'millimeter',
            CodingSchemeDesignator: 'UCUM'
          }],
          NumericValue: 5
        }],
        ValueType: 'CODE'
      }
      const roi = new dmv.roi.ROI({ scoord3d: point })
      expect(roi.properties).toEqual(
        {
          measurements: [],
          evaluations: []
        }
      )
      expect(roi.measurements).toEqual([])
      expect(roi.evaluations).toEqual([])
      roi.addMeasurement(measurement)
      expect(roi.properties).toEqual(
        {
          measurements: [measurement],
          evaluations: []
        }
      )
      expect(roi.measurements).toEqual([measurement])
      expect(roi.evaluations).toEqual([])
    })

    it('should create a Point ROI and return it back successfuly', () => {
      const roi = new dmv.roi.ROI({ scoord3d: point })
      viewer.addROI(roi)
      expect(viewer.getROI(roi.uid).scoord3d.graphicData).toEqual(
        point.graphicData
      )
      expect(viewer.getROI(roi.uid).properties).toEqual(
        {
          measurements: [],
          evaluations: []
        }
      )
      expect(viewer.getROI(roi.uid).measurements).toEqual([])
      expect(viewer.getROI(roi.uid).evaluations).toEqual([])
    })

    it('should create a Box ROI and return it back successfuly', () => {
      const roi = new dmv.roi.ROI({ scoord3d: box })
      viewer.addROI(roi)
      const measurement = {
        ConceptNameCodeSequence: [{
          CodeValue: '410668003',
          CodeMeaning: 'Length',
          CodingSchemeDesignator: 'DCM'
        }],
        MeasuredValueSequence: [{
          MeasurementUnitsCodeSequence: [{
            CodeValue: 'mm',
            CodeMeaning: 'millimeter',
            CodingSchemeDesignator: 'UCUM'
          }],
          NumericValue: 5
        }],
        ValueType: 'CODE'
      }
      viewer.addROIMeasurement(roi.uid, measurement)
      const evaluation = {
        ConceptNameCodeSequence: [{
          CodeValue: '121071',
          CodeMeaning: 'Finding',
          CodingSchemeDesignator: 'DCM'
        }],
        ConceptCodeSequence: [{
          CodeValue: '108369006',
          CodingSchemeDesignator: 'SCT',
          CodeMeaning: 'Tumor'
        }],
        ValueType: 'CODE'
      }
      viewer.addROIEvaluation(roi.uid, evaluation)
      expect(viewer.getROI(roi.uid).scoord3d.graphicData).toEqual(box.graphicData)
      expect(viewer.getROI(roi.uid).properties).toEqual(
        {
          measurements: [measurement],
          evaluations: [evaluation]
        }
      )
      expect(viewer.getROI(roi.uid).measurements).toEqual(
        [measurement]
      )
      expect(viewer.getROI(roi.uid).evaluations).toEqual(
        [evaluation]
      )
    })

    it('should create a Polygon ROI and return it back successfuly', () => {
      const roi = new dmv.roi.ROI({ scoord3d: polygon })
      viewer.addROI(roi)
      expect(viewer.getROI(roi.uid).scoord3d.graphicData).toEqual(
        polygon.graphicData
      )
    })

    it('should create a Freehand Polygon ROI and return it back successfuly', () => {
      const roi = new dmv.roi.ROI({
        scoord3d: freehandPolygon
      })
      viewer.addROI(roi)
      expect(viewer.getROI(roi.uid).scoord3d.graphicData).toEqual(
        freehandPolygon.graphicData
      )
    })

    it('should create a Line ROI and return it back successfuly', () => {
      const roi = new dmv.roi.ROI({ scoord3d: line })
      viewer.addROI(roi)
      expect(viewer.getROI(roi.uid).scoord3d.graphicData).toEqual(
        line.graphicData
      )
    })

    it('should create a FreehandLine ROI and return it back successfuly', () => {
      const roi = new dmv.roi.ROI({ scoord3d: freeHandLine })
      viewer.addROI(roi)
      expect(viewer.getROI(roi.uid).scoord3d.graphicData).toEqual(
        freeHandLine.graphicData
      )
    })

    it('should return all ROIs created up to now', () => {
      const rois = viewer.getAllROIs()
      expect(rois.length).toEqual(6)
    })

    it('should be able to remove the point ROI', () => {
      let rois = viewer.getAllROIs()
      expect(rois.length).toEqual(6)
      expect(viewer.getROI(rois[0].uid).scoord3d.graphicData).toEqual(
        point.graphicData
      )
      viewer.removeROI(rois[0].uid)
      rois = viewer.getAllROIs()
      expect(rois.length).toEqual(5)
      expect(viewer.getROI(rois[0].uid).scoord3d.graphicData).toEqual(
        box.graphicData
      )
    })

    it('should create an Ellipse ROI and return it back successfuly', () => {
      const roi = new dmv.roi.ROI({
        scoord3d: ellipse
      })
      viewer.addROI(roi)
      expect(viewer.getROI(roi.uid).scoord3d.graphicData[0]).toEqual(
        ellipse.graphicData[0]
      )
      expect(viewer.getROI(roi.uid).scoord3d.graphicData[1]).toEqual(
        ellipse.graphicData[1]
      )
    })

    it('should remove all ROIs', () => {
      viewer.removeAllROIs()
      expect(viewer.getAllROIs()).toEqual([])
    })

    it('should throw an error if uid of ROI is undefined', () => {
      expect(() => {
        const roi = new dmv.roi.ROI({
          scoord3d: point,
          uid: undefined,
          properties: {}
        })
        expect(roi).toBeFalsy()
      }).toThrow(
        Error
      )
    })

    it('should throw an error if uid of ROI is null', () => {
      expect(() => {
        const roi = new dmv.roi.ROI({
          scoord3d: point,
          uid: null,
          properties: {}
        })
        expect(roi).toBeFalsy()
      }).toThrow(
        Error
      )
    })
  })
})
