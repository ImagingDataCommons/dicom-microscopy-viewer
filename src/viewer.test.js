const testCase1 = require('../test/data/TCGA-LUAD_TCGA-05-4244-01Z-00-DX1.json');
const testCase2 = require('../test/data/HTA9_1_BA_L.json');
const testCase3 = require('../test/data/C3N-01016-22.json');

const dmv = require('./dicom-microscopy-viewer.js');

jest.mock('ol/webgl/Helper', () => jest.fn(() => null), { virtual: true });

window.ResizeObserver =
  window.ResizeObserver ||
  jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn(),
  }));

const testCases = [
  {
    name: 'TCGA-LUAD_TCGA-05-4244-01Z-00-DX1',
    inputs: {
      images: testCase1.images.map((metadata) => {
        return new dmv.metadata.VLWholeSlideMicroscopyImage({
          metadata,
        });
      }),
      annotations: testCase1.annotations.map((metadata) => {
        return new dmv.metadata.MicroscopyBulkSimpleAnnotations({
          metadata,
        });
      }),
      segmentations: [],
      maps: [],
    },
    expectations: {
      levels: 4,
      opticalPaths: {
        1: {
          description: new dmv.opticalPath.OpticalPath({
            identifier: '1',
            illuminationType: {
              CodeValue: '111744',
              CodingSchemeDesignator: 'DCM',
              CodeMeaning: 'Brightfield illumination',
            },
            illuminationColor: {
              CodeValue: '414298005',
              CodingSchemeDesignator: 'SCT',
              CodeMeaning: 'Full Spectrum',
            },
            studyInstanceUID: '2.25.18199272949575141157802058345697568861',
            seriesInstanceUID:
              '1.3.6.1.4.1.5962.99.1.3510881361.982628633.1635598486609.2.0',
            sopInstanceUIDs: [
              '1.3.6.1.4.1.5962.99.1.3510881361.982628633.1635598486609.29.0',
              '1.3.6.1.4.1.5962.99.1.3510881361.982628633.1635598486609.22.0',
              '1.3.6.1.4.1.5962.99.1.3510881361.982628633.1635598486609.8.0',
              '1.3.6.1.4.1.5962.99.1.3510881361.982628633.1635598486609.15.0',
            ],
            isMonochromatic: false,
          }),
          style: {
            opacity: 1,
          },
        },
      },
      annotationGroups: {
        '1.2.826.0.1.3680043.10.511.3.73444720650189355811359866120947104': {
          description: new dmv.annotation.AnnotationGroup({
            uid: '1.2.826.0.1.3680043.10.511.3.73444720650189355811359866120947104',
            number: '1',
            label: 'nuclei',
            propertyCategory: {
              CodeValue: '91723000',
              CodingSchemeDesignator: 'SCT',
              CodeMeaning: 'Anatomical Structure',
            },
            propertyType: {
              CodeValue: '84640000',
              CodingSchemeDesignator: 'SCT',
              CodeMeaning: 'Nucleus',
            },
            algorithmType: {
              CodeValue: '123110',
              CodingSchemeDesignator: 'DCM',
              CodeMeaning: 'Artificial Intelligence',
            },
            algorithmName: 'Pan-Cancer-Nuclei-Seg',
            studyInstanceUID: '2.25.18199272949575141157802058345697568861',
            seriesInstanceUID:
              '1.2.826.0.1.3680043.10.511.3.27569988062149844051578278924216007',
            sopInstanceUIDs: [
              '1.2.826.0.1.3680043.10.511.3.83728028916683376928355673628284368',
            ],
          }),
          style: {
            color: [0, 126, 163],
            opacity: 1,
          },
        },
      },
      segments: {},
      mappings: {},
    },
  },
  {
    name: 'HTA9_1_BA_L',
    inputs: {
      images: testCase2.images.map((metadata) => {
        return new dmv.metadata.VLWholeSlideMicroscopyImage({
          metadata,
        });
      }),
      annotations: [],
      segmentations: [],
      maps: [],
    },
    expectations: {
      levels: 3,
      opticalPaths: {
        0: {
          description: new dmv.opticalPath.OpticalPath({
            identifier: '0',
            illuminationType: {
              CodeValue: '111743',
              CodingSchemeDesignator: 'DCM',
              CodeMeaning: 'Epifluorescence Illumination',
            },
            studyInstanceUID:
              '1.3.6.1.4.1.5962.99.1.2414596.416073461.1623500085252.3.0',
            seriesInstanceUID: '1.3.6.1.4.1.5962.1.3.0.0.1623416162.84756.0',
            sopInstanceUIDs: [
              '1.3.6.1.4.1.5962.99.1.2414596.416073461.1623500085252.8.0',
              '1.3.6.1.4.1.5962.99.1.2437079.135899065.1623500107735.2.0',
              '1.3.6.1.4.1.5962.99.1.2437079.135899065.1623500107735.3.0',
            ],
            isMonochromatic: true,
          }),
          style: {
            color: [255, 255, 255],
            opacity: 1,
            limitValues: [0, 255],
          },
        },
        1: {
          description: new dmv.opticalPath.OpticalPath({
            identifier: '1',
            illuminationType: {
              CodeValue: '111743',
              CodingSchemeDesignator: 'DCM',
              CodeMeaning: 'Epifluorescence Illumination',
            },
            studyInstanceUID:
              '1.3.6.1.4.1.5962.99.1.2414596.416073461.1623500085252.3.0',
            seriesInstanceUID: '1.3.6.1.4.1.5962.1.3.0.0.1623416162.84756.1',
            sopInstanceUIDs: [
              '1.3.6.1.4.1.5962.99.1.2439424.110472347.1623500110080.3.0',
              '1.3.6.1.4.1.5962.99.1.2414596.416073461.1623500085252.15.0',
              '1.3.6.1.4.1.5962.99.1.2439424.110472347.1623500110080.2.0',
            ],
            isMonochromatic: true,
          }),
          style: {
            color: [255, 255, 255],
            opacity: 1,
            limitValues: [0, 255],
          },
        },
        3: {
          description: new dmv.opticalPath.OpticalPath({
            identifier: '3',
            illuminationType: {
              CodeValue: '111743',
              CodingSchemeDesignator: 'DCM',
              CodeMeaning: 'Epifluorescence Illumination',
            },
            studyInstanceUID:
              '1.3.6.1.4.1.5962.99.1.2414596.416073461.1623500085252.3.0',
            seriesInstanceUID: '1.3.6.1.4.1.5962.1.3.0.0.1623416162.84756.2',
            sopInstanceUIDs: [
              '1.3.6.1.4.1.5962.99.1.2414596.416073461.1623500085252.22.0',
              '1.3.6.1.4.1.5962.99.1.2446200.1818727514.1623500116856.2.0',
              '1.3.6.1.4.1.5962.99.1.2446200.1818727514.1623500116856.3.0',
            ],
            isMonochromatic: true,
          }),
          style: {
            color: [255, 255, 255],
            opacity: 1,
            limitValues: [0, 255],
          },
        },
      },
      annotationGroups: {},
      segments: {},
      mappings: {},
    },
  },
  {
    name: 'C3N-01016-22',
    inputs: {
      images: testCase3.images.map((metadata) => {
        return new dmv.metadata.VLWholeSlideMicroscopyImage({
          metadata,
        });
      }),
      annotations: [],
      segmentations: testCase3.segmentations.map((instances) => {
        return instances.map((metadata) => {
          return new dmv.metadata.Segmentation({ metadata });
        });
      }),
      maps: testCase3.maps.map((instances) => {
        return instances.map((metadata) => {
          return new dmv.metadata.ParametricMap({ metadata });
        });
      }),
    },
    expectations: {
      levels: 4,
      opticalPaths: {
        1: {
          description: new dmv.opticalPath.OpticalPath({
            identifier: '1',
            illuminationType: {
              CodeValue: '111744',
              CodingSchemeDesignator: 'DCM',
              CodeMeaning: 'Brightfield illumination',
            },
            illuminationColor: {
              CodeValue: '414298005',
              CodingSchemeDesignator: 'SCT',
              CodeMeaning: 'Full Spectrum',
            },
            studyInstanceUID:
              '1.3.6.1.4.1.5962.99.1.2447135355.1068687300.1625944806011.3.0',
            seriesInstanceUID:
              '1.3.6.1.4.1.5962.99.1.2447135355.1068687300.1625944806011.2.0',
            sopInstanceUIDs: [
              '1.3.6.1.4.1.5962.99.1.2447135355.1068687300.1625944806011.28.0',
              '1.3.6.1.4.1.5962.99.1.2447135355.1068687300.1625944806011.21.0',
              '1.3.6.1.4.1.5962.99.1.2447135355.1068687300.1625944806011.7.0',
              '1.3.6.1.4.1.5962.99.1.2447135355.1068687300.1625944806011.14.0',
            ],
            isMonochromatic: true,
          }),
          style: {
            opacity: 1,
          },
        },
      },
      annotationGroups: {},
      segments: {
        '1.2.826.0.1.3680043.10.511.3.13183093527413438105460333203723867': {
          description: new dmv.segment.Segment({
            uid: '1.2.826.0.1.3680043.10.511.3.13183093527413438105460333203723867',
            number: '1',
            label: 'tissue',
            propertyCategory: {
              CodeValue: '91723000',
              CodingSchemeDesignator: 'SCT',
              CodeMeaning: 'Anatomical Structure',
            },
            propertyType: {
              CodeValue: '85756007',
              CodingSchemeDesignator: 'SCT',
              CodeMeaning: 'Tissue',
            },
            algorithmType: {
              CodeValue: '123105',
              CodingSchemeDesignator: 'DCM',
              CodeMeaning: 'Histogram Analysis',
            },
            algorithmName: 'utils',
            studyInstanceUID:
              '1.3.6.1.4.1.5962.99.1.2447135355.1068687300.1625944806011.3.0',
            seriesInstanceUID:
              '1.2.826.0.1.3680043.10.511.3.10505587866967969448551914025853045',
            sopInstanceUIDs: [
              '1.2.826.0.1.3680043.10.511.3.23371309443298107030361124464692090',
            ],
          }),
          style: {
            opacity: 0.75,
            paletteColorLookupTable: dmv.color.buildPaletteColorLookupTable({
              data: dmv.color.createColormap({
                name: dmv.color.ColormapNames.VIRIDIS,
                bins: 256,
              }),
              firstValueMapped: 0,
            }),
          },
        },
      },
      mappings: {
        '1.2.826.0.1.3680043.10.511.3.12513676296929162651625754360127915': {
          description: new dmv.mapping.ParameterMapping({
            uid: '1.2.826.0.1.3680043.10.511.3.12513676296929162651625754360127915',
            number: '1',
            label: 'Nontumor',
            description: 'Non-tumor',
            studyInstanceUID:
              '1.3.6.1.4.1.5962.99.1.2447135355.1068687300.1625944806011.3.0',
            seriesInstanceUID:
              '1.2.826.0.1.3680043.10.511.3.13340900559842750919196551140041183',
            sopInstanceUIDs: [
              '1.2.826.0.1.3680043.10.511.3.97885701157697100824037867909594934',
            ],
          }),
          style: {
            opacity: 1,
            paletteColorLookupTable: dmv.color.buildPaletteColorLookupTable({
              data: dmv.color.createColormap({
                name: dmv.color.ColormapNames.BLUE_RED,
                bins: 256,
              }),
              firstValueMapped: 0,
            }),
          },
        },
        '1.2.826.0.1.3680043.10.511.3.41048468254862710418744291748294259': {
          description: new dmv.mapping.ParameterMapping({
            uid: '1.2.826.0.1.3680043.10.511.3.41048468254862710418744291748294259',
            number: '2',
            label: 'Tumor',
            description: 'Tumor',
            studyInstanceUID:
              '1.3.6.1.4.1.5962.99.1.2447135355.1068687300.1625944806011.3.0',
            seriesInstanceUID:
              '1.2.826.0.1.3680043.10.511.3.13340900559842750919196551140041183',
            sopInstanceUIDs: [
              '1.2.826.0.1.3680043.10.511.3.97885701157697100824037867909594934',
            ],
          }),
          style: {
            opacity: 1,
            paletteColorLookupTable: dmv.color.buildPaletteColorLookupTable({
              data: dmv.color.createColormap({
                name: dmv.color.ColormapNames.BLUE_RED,
                bins: 256,
              }),
              firstValueMapped: 0,
            }),
          },
        },
      },
    },
  },
];

describe.each(testCases)(
  'test viewer API for ROI annotations of "$name"',
  ({ name, inputs, expectations }) => {
    let viewer;
    beforeEach(() => {
      viewer = new dmv.viewer.VolumeImageViewer({
        client: {},
        metadata: inputs.images,
      });
    });

    afterEach(() => {
      viewer = undefined;
    });

    const refImage = inputs.images[0];
    const ellipse = new dmv.scoord3d.Ellipse({
      coordinates: [
        [8.0, 9.2, 0],
        [8.8, 9.2, 0],
        [8.2, 9.0, 0],
        [8.2, 9.4, 0],
      ],
      frameOfReferenceUID: refImage.FrameOfReferenceUID,
    });

    const point = new dmv.scoord3d.Point({
      coordinates: [9.0467, 8.7631, 0],
      frameOfReferenceUID: refImage.FrameOfReferenceUID,
    });

    const box = new dmv.scoord3d.Polygon({
      coordinates: [
        [8.8824, 8.8684, 0],
        [9.2255, 9.9634, 0],
        [10.3205, 9.6203, 0],
        [9.9774, 8.5253, 0],
        [8.8824, 8.8684, 0],
      ],
      frameOfReferenceUID: refImage.FrameOfReferenceUID,
    });

    const polygon = new dmv.scoord3d.Polygon({
      coordinates: [
        [7.8326, 8.4428, 0],
        [7.1919, 7.9169, 0],
        [8.7772, 7.2831, 0],
        [7.8326, 8.4428, 0],
      ],
      frameOfReferenceUID: refImage.FrameOfReferenceUID,
    });

    const freehandPolygon = new dmv.scoord3d.Polygon({
      coordinates: [
        [6.934, 7.0669, 0],
        [6.934, 7.0669, 0],
        [6.9189, 7.0216, 0],
        [6.9114, 6.9973, 0],
        [6.9114, 6.9797, 0],
        [6.9139, 6.9621, 0],
        [6.9216, 6.947, 0],
        [6.9292, 6.9344, 0],
        [6.9419, 6.9294, 0],
        [6.9496, 6.9269, 0],
        [6.9597, 6.9243, 0],
        [6.9674, 6.9243, 0],
        [6.9674, 6.9243, 0],
        [6.934, 7.0669, 0],
      ],
      frameOfReferenceUID: refImage.FrameOfReferenceUID,
    });

    const line = new dmv.scoord3d.Polyline({
      coordinates: [
        [7.0442, 7.5295, 0],
        [7.6725, 7.058, 0],
      ],
      frameOfReferenceUID: refImage.FrameOfReferenceUID,
    });

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
        [6.6258, 9.002, 0],
        [6.6284, 8.9995, 0],
        [6.6334, 8.9945, 0],
        [6.636, 8.9945, 0],
      ],
      frameOfReferenceUID: refImage.FrameOfReferenceUID,
    });

    it('should return [] if there is no drawing', () => {
      expect(viewer.getAllROIs()).toEqual([]);
    });

    it('should add property to ROI upon construction', () => {
      const roi = new dmv.roi.ROI({
        scoord3d: point,
        properties: { foo: 'bar' },
      });
      expect(roi.properties).toEqual({
        foo: 'bar',
        measurements: [],
        evaluations: [],
      });
      expect(roi.measurements).toEqual([]);
      expect(roi.evaluations).toEqual([]);
    });

    it('should add evaluation to ROI upon construction', () => {
      const evaluation = {
        ConceptNameCodeSequence: [
          {
            CodeValue: '121071',
            CodeMeaning: 'Finding',
            CodingSchemeDesignator: 'DCM',
          },
        ],
        ConceptCodeSequence: [
          {
            CodeValue: '108369006',
            CodingSchemeDesignator: 'SCT',
            CodeMeaning: 'Tumor',
          },
        ],
        ValueType: 'CODE',
      };
      const roi = new dmv.roi.ROI({
        scoord3d: point,
        properties: {
          evaluations: [evaluation],
        },
      });
      expect(roi.properties).toEqual({
        measurements: [],
        evaluations: [evaluation],
      });
      expect(roi.measurements).toEqual([]);
      expect(roi.evaluations).toEqual([evaluation]);
    });

    it('should add property to ROI upon construction', () => {
      const roi = new dmv.roi.ROI({ scoord3d: point });
      expect(roi.properties).toEqual({
        measurements: [],
        evaluations: [],
      });
      expect(roi.measurements).toEqual([]);
      expect(roi.evaluations).toEqual([]);
    });

    it('should add evaluation to ROI upon construction', () => {
      const evaluation = {
        ConceptNameCodeSequence: [
          {
            CodeValue: '121071',
            CodeMeaning: 'Finding',
            CodingSchemeDesignator: 'DCM',
          },
        ],
        ConceptCodeSequence: [
          {
            CodeValue: '108369006',
            CodingSchemeDesignator: 'SCT',
            CodeMeaning: 'Tumor',
          },
        ],
        ValueType: 'CODE',
      };
      const roi = new dmv.roi.ROI({
        scoord3d: point,
        properties: {
          evaluations: [evaluation],
        },
      });
      expect(roi.properties).toEqual({
        measurements: [],
        evaluations: [evaluation],
      });
      expect(roi.measurements).toEqual([]);
      expect(roi.evaluations).toEqual([evaluation]);
    });

    it('should add measurement to ROI upon construction', () => {
      const measurement = {
        ConceptNameCodeSequence: [
          {
            CodeValue: '410668003',
            CodeMeaning: 'Length',
            CodingSchemeDesignator: 'DCM',
          },
        ],
        MeasuredValueSequence: [
          {
            MeasurementUnitsCodeSequence: [
              {
                CodeValue: 'mm',
                CodeMeaning: 'millimeter',
                CodingSchemeDesignator: 'UCUM',
              },
            ],
            NumericValue: 5,
          },
        ],
        ValueType: 'CODE',
      };
      const roi = new dmv.roi.ROI({
        scoord3d: point,
        properties: { measurements: [measurement] },
      });
      expect(roi.properties).toEqual({
        measurements: [measurement],
        evaluations: [],
      });
      expect(roi.measurements).toEqual([measurement]);
      expect(roi.evaluations).toEqual([]);
    });

    it('should add measurement to ROI after construction', () => {
      const measurement = {
        ConceptNameCodeSequence: [
          {
            CodeValue: '410668003',
            CodeMeaning: 'Length',
            CodingSchemeDesignator: 'DCM',
          },
        ],
        MeasuredValueSequence: [
          {
            MeasurementUnitsCodeSequence: [
              {
                CodeValue: 'mm',
                CodeMeaning: 'millimeter',
                CodingSchemeDesignator: 'UCUM',
              },
            ],
            NumericValue: 5,
          },
        ],
        ValueType: 'CODE',
      };
      const roi = new dmv.roi.ROI({ scoord3d: point });
      expect(roi.properties).toEqual({
        measurements: [],
        evaluations: [],
      });
      expect(roi.measurements).toEqual([]);
      expect(roi.evaluations).toEqual([]);
      roi.addMeasurement(measurement);
      expect(roi.properties).toEqual({
        measurements: [measurement],
        evaluations: [],
      });
      expect(roi.measurements).toEqual([measurement]);
      expect(roi.evaluations).toEqual([]);
    });

    it('should create a Point ROI and return it back', () => {
      const roi = new dmv.roi.ROI({ scoord3d: point });
      viewer.addROI(roi);
      expect(viewer.getROI(roi.uid).scoord3d.graphicData).toEqual(
        point.graphicData
      );
      expect(viewer.getROI(roi.uid).properties).toEqual({
        measurements: [],
        evaluations: [],
      });
      expect(viewer.getROI(roi.uid).measurements).toEqual([]);
      expect(viewer.getROI(roi.uid).evaluations).toEqual([]);
    });

    it('should create a Box ROI and return it back', () => {
      const roi = new dmv.roi.ROI({ scoord3d: box });
      viewer.addROI(roi);
      const measurement = {
        ConceptNameCodeSequence: [
          {
            CodeValue: '410668003',
            CodeMeaning: 'Length',
            CodingSchemeDesignator: 'DCM',
          },
        ],
        MeasuredValueSequence: [
          {
            MeasurementUnitsCodeSequence: [
              {
                CodeValue: 'mm',
                CodeMeaning: 'millimeter',
                CodingSchemeDesignator: 'UCUM',
              },
            ],
            NumericValue: 5,
          },
        ],
        ValueType: 'CODE',
      };
      viewer.addROIMeasurement(roi.uid, measurement);
      const evaluation = {
        ConceptNameCodeSequence: [
          {
            CodeValue: '121071',
            CodeMeaning: 'Finding',
            CodingSchemeDesignator: 'DCM',
          },
        ],
        ConceptCodeSequence: [
          {
            CodeValue: '108369006',
            CodingSchemeDesignator: 'SCT',
            CodeMeaning: 'Tumor',
          },
        ],
        ValueType: 'CODE',
      };
      viewer.addROIEvaluation(roi.uid, evaluation);
      expect(viewer.getROI(roi.uid).scoord3d.graphicData).toEqual(
        box.graphicData
      );
      expect(viewer.getROI(roi.uid).properties).toEqual({
        measurements: [measurement],
        evaluations: [evaluation],
      });
      expect(viewer.getROI(roi.uid).measurements).toEqual([measurement]);
      expect(viewer.getROI(roi.uid).evaluations).toEqual([evaluation]);
    });

    it('should create a Polygon ROI and return it back', () => {
      const roi = new dmv.roi.ROI({ scoord3d: polygon });
      viewer.addROI(roi);
      expect(viewer.getROI(roi.uid).scoord3d.graphicData).toEqual(
        polygon.graphicData
      );
      expect(viewer.getAllROIs().length).toEqual(1);
    });

    it('should create a Freehand Polygon ROI and return it back', () => {
      const roi = new dmv.roi.ROI({
        scoord3d: freehandPolygon,
      });
      viewer.addROI(roi);
      expect(viewer.getROI(roi.uid).scoord3d.graphicData).toEqual(
        freehandPolygon.graphicData
      );
      expect(viewer.getAllROIs().length).toEqual(1);
    });

    it('should create a Line ROI and return it back', () => {
      const roi = new dmv.roi.ROI({ scoord3d: line });
      viewer.addROI(roi);
      expect(viewer.getROI(roi.uid).scoord3d.graphicData).toEqual(
        line.graphicData
      );
      expect(viewer.getAllROIs().length).toEqual(1);
    });

    it('should create a FreehandLine ROI and return it back', () => {
      const roi = new dmv.roi.ROI({ scoord3d: freeHandLine });
      viewer.addROI(roi);
      expect(viewer.getROI(roi.uid).scoord3d.graphicData).toEqual(
        freeHandLine.graphicData
      );
      expect(viewer.getAllROIs().length).toEqual(1);
    });

    it('should create and remove a ROI', () => {
      const roi = new dmv.roi.ROI({ scoord3d: polygon });
      viewer.addROI(roi);
      expect(viewer.getROI(roi.uid).scoord3d.graphicData).toEqual(
        polygon.graphicData
      );
      expect(viewer.getAllROIs().length).toEqual(1);
      viewer.removeROI(roi.uid);
      expect(viewer.getAllROIs().length).toEqual(0);
    });

    it('should create an Ellipse ROI and return it back', () => {
      const roi = new dmv.roi.ROI({
        scoord3d: ellipse,
      });
      viewer.addROI(roi);
      expect(viewer.getAllROIs().length).toEqual(1);
      expect(viewer.getROI(roi.uid).scoord3d.graphicData[0]).toEqual(
        ellipse.graphicData[0]
      );
      expect(viewer.getROI(roi.uid).scoord3d.graphicData[1]).toEqual(
        ellipse.graphicData[1]
      );
    });

    it('should remove all ROIs', () => {
      const roi1 = new dmv.roi.ROI({ scoord3d: polygon });
      viewer.addROI(roi1);
      expect(viewer.getAllROIs().length).toEqual(1);
      const roi2 = new dmv.roi.ROI({ scoord3d: line });
      viewer.addROI(roi2);
      const roi3 = new dmv.roi.ROI({ scoord3d: point });
      viewer.addROI(roi3);
      expect(viewer.getAllROIs().length).toEqual(3);
      viewer.removeAllROIs();
      expect(viewer.getAllROIs().length).toEqual(0);
    });

    it('should throw an error if uid of ROI is undefined', () => {
      expect(() => {
        const roi = new dmv.roi.ROI({
          scoord3d: point,
          uid: undefined,
          properties: {},
        });
        expect(roi).toBeFalsy();
      }).toThrow(Error);
    });

    it('should throw an error if uid of ROI is null', () => {
      expect(() => {
        const roi = new dmv.roi.ROI({
          scoord3d: point,
          uid: null,
          properties: {},
        });
        expect(roi).toBeFalsy();
      }).toThrow(Error);
    });

    it('should throw an error if Frame of Reference UID of ROI is wrong', () => {
      expect(() => {
        const wrongPoint = new dmv.scoord3d.Point({
          coordinates: [9.0467, 8.7631, 0],
          frameOfReferenceUID: '1.2.3.4',
        });
        const roi = new dmv.roi.ROI({ scoord3d: wrongPoint });
        expect(roi).toBeFalsy();
      }).toThrow(Error);
    });
  }
);

describe.each(testCases)(
  'test viewer API for optical paths of "$name"',
  ({ name, inputs, expectations }) => {
    let viewer;
    beforeEach(() => {
      viewer = new dmv.viewer.VolumeImageViewer({
        client: {},
        metadata: inputs.images,
      });
    });

    afterEach(() => {
      viewer = undefined;
    });

    it('should return correct number of optical paths', () => {
      const opticalPaths = viewer.getAllOpticalPaths();
      const expectedIds = Object.keys(expectations.opticalPaths);
      expect(opticalPaths.length).toEqual(expectedIds.length);
    });

    it('should return correct number of optical path metadata items', () => {
      const expectedIds = Object.keys(expectations.opticalPaths);
      expectedIds.forEach((id) => {
        const metadata = viewer.getOpticalPathMetadata(id);
        const expectedOpticalPath = expectations.opticalPaths[id];
        expect(metadata.length).toEqual(
          expectedOpticalPath.description.sopInstanceUIDs.length
        );
      });
    });

    it('should return default optical path style', () => {
      const expectedIds = Object.keys(expectations.opticalPaths);
      expectedIds.forEach((id) => {
        const style = viewer.getOpticalPathStyle(id);
        const defaultStyle = viewer.getOpticalPathDefaultStyle(id);
        const expectedOpticalPath = expectations.opticalPaths[id];
        expect(style).toEqual(expectedOpticalPath.style);
        expect(!(style.color != null && style.paletteColorLookupTable != null));
        expect(defaultStyle).toEqual(expectedOpticalPath.style);
      });
    });

    it('should set optical path style', () => {
      const id = Object.keys(expectations.opticalPaths)[0];
      const styleOptions = {
        opacity: 0.7,
      };
      viewer.setOpticalPathStyle(id, styleOptions);
      const style = viewer.getOpticalPathStyle(id);
      const expectedStyle = Object.assign({}, style);
      Object.keys(styleOptions).forEach((key) => {
        expectedStyle[key] = styleOptions[key];
      });
      expect(style).toEqual(expectedStyle);
      expect(!(style.color != null && style.paletteColorLookupTable != null));
      const defaultStyle = viewer.getOpticalPathDefaultStyle(id);
      expect(defaultStyle).not.toEqual(expectedStyle);
    });

    it('should change optical path visibility', () => {
      const id = Object.keys(expectations.opticalPaths)[0];
      let isVisible;
      viewer.showOpticalPath(id);
      isVisible = viewer.isOpticalPathVisible(id);
      expect(isVisible).toBeTruthy();
      viewer.hideOpticalPath(id);
      isVisible = viewer.isOpticalPathVisible(id);
      expect(isVisible).toBeFalsy();
      viewer.showOpticalPath(id);
      isVisible = viewer.isOpticalPathVisible(id);
      expect(isVisible).toBeTruthy();
    });

    it('should change optical path activity', () => {
      const id = Object.keys(expectations.opticalPaths)[0];
      let isActive;
      viewer.activateOpticalPath(id);
      isActive = viewer.isOpticalPathActive(id);
      expect(isActive).toBeTruthy();
      viewer.deactivateOpticalPath(id);
      isActive = viewer.isOpticalPathActive(id);
      expect(isActive).toBeFalsy();
      viewer.activateOpticalPath(id);
      isActive = viewer.isOpticalPathActive(id);
      expect(isActive).toBeTruthy();
    });
  }
);

describe.each(testCases)(
  'test viewer API for annotation groups of "$name"',
  ({ name, inputs, expectations }) => {
    let viewer;
    beforeEach(() => {
      viewer = new dmv.viewer.VolumeImageViewer({
        client: {},
        metadata: inputs.images,
      });
    });

    afterEach(() => {
      viewer = undefined;
    });

    it('should add and remove annotation groups', () => {
      expect(viewer.getAllAnnotationGroups().length).toEqual(0);
      inputs.annotations.forEach((metadata) => {
        viewer.addAnnotationGroups(metadata);
      });
      const annotationGroups = viewer.getAllAnnotationGroups();
      expect(annotationGroups.length).toEqual(
        Object.keys(expectations.annotationGroups).length
      );
      viewer.removeAllAnnotationGroups();
      expect(viewer.getAllAnnotationGroups().length).toEqual(0);
    });

    it('should change annotation group visibility', () => {
      inputs.annotations.forEach((metadata) => {
        viewer.addAnnotationGroups(metadata);
      });
      const annotationGroupUIDs = Object.keys(expectations.annotationGroups);
      if (annotationGroupUIDs.length > 0) {
        const index = 0;
        const uid = annotationGroupUIDs[index];
        let isVisible;
        viewer.showAnnotationGroup(uid);
        isVisible = viewer.isAnnotationGroupVisible(uid);
        expect(isVisible).toBeTruthy();
        viewer.hideAnnotationGroup(uid);
        isVisible = viewer.isAnnotationGroupVisible(uid);
        expect(isVisible).toBeFalsy();
        viewer.showAnnotationGroup(uid);
        isVisible = viewer.isAnnotationGroupVisible(uid);
        expect(isVisible).toBeTruthy();
      }
    });

    it('should return default annotation group style', () => {
      inputs.annotations.forEach((metadata) => {
        viewer.addAnnotationGroups(metadata);
        const uid = metadata.AnnotationGroupSequence[0].AnnotationGroupUID;
        const style = viewer.getAnnotationGroupStyle(uid);
        expect(style).toEqual(expectations.annotationGroups[uid].style);
      });
    });

    it('should set annotation group style', () => {
      inputs.annotations.forEach((metadata) => {
        viewer.addAnnotationGroups(metadata);
      });
      const annotationGroupUIDs = Object.keys(expectations.annotationGroups);
      if (annotationGroupUIDs.length > 0) {
        const index = 0;
        const uid = annotationGroupUIDs[index];
        const styleOptions = {
          opacity: 0.7,
        };
        viewer.setAnnotationGroupStyle(uid, styleOptions);
        const style = viewer.getAnnotationGroupStyle(uid);
        const expectedStyle = Object.assign({}, style);
        Object.keys(styleOptions).forEach((key) => {
          expectedStyle[key] = styleOptions[key];
        });
        expect(style).toEqual(expectedStyle);
      }
    });
  }
);

describe.each(testCases)(
  'test viewer API for segments of "$name"',
  ({ name, inputs, expectations }) => {
    let viewer;
    beforeEach(() => {
      viewer = new dmv.viewer.VolumeImageViewer({
        client: {},
        metadata: inputs.images,
      });
    });

    afterEach(() => {
      viewer = undefined;
    });

    it('should add and remove segments', () => {
      expect(viewer.getAllSegments().length).toEqual(0);
      inputs.segmentations.forEach((metadata) => {
        viewer.addSegments(metadata);
      });
      const segments = viewer.getAllSegments();
      expect(segments.length).toEqual(
        Object.keys(expectations.segments).length
      );
      viewer.removeAllSegments();
      expect(viewer.getAllSegments().length).toEqual(0);
    });

    it('should change segment visibility', () => {
      inputs.segmentations.forEach((metadata) => {
        viewer.addSegments(metadata);
      });
      const segmentUIDs = Object.keys(expectations.segments);
      if (segmentUIDs.length > 0) {
        const index = 0;
        const uid = segmentUIDs[index];
        let isVisible;
        viewer.showSegment(uid);
        isVisible = viewer.isSegmentVisible(uid);
        expect(isVisible).toBeTruthy();
        viewer.hideSegment(uid);
        isVisible = viewer.isSegmentVisible(uid);
        expect(isVisible).toBeFalsy();
        viewer.showSegment(uid);
        isVisible = viewer.isSegmentVisible(uid);
        expect(isVisible).toBeTruthy();
      }
    });

    it('should return default segment style', () => {
      inputs.segmentations.forEach((metadata) => {
        viewer.addSegments(metadata);
        const uid = metadata[0].SegmentSequence[0].TrackingUID;
        const style = viewer.getSegmentStyle(uid);
        const expectedStyle = expectations.segments[uid].style;
        expect(style.opacity).toEqual(expectedStyle.opacity);
        expect(style.paletteColorLookupTable.data).toEqual(
          expectedStyle.paletteColorLookupTable.data
        );
      });
    });

    it('should set segment style', () => {
      inputs.segmentations.forEach((metadata) => {
        viewer.addSegments(metadata);
      });
      const segmentUIDs = Object.keys(expectations.segments);
      if (segmentUIDs.length > 0) {
        const index = 0;
        const uid = segmentUIDs[index];
        const styleOptions = {
          opacity: 0.7,
        };
        viewer.setSegmentStyle(uid, styleOptions);
        const style = viewer.getSegmentStyle(uid);
        const expectedStyle = Object.assign({}, style);
        Object.keys(styleOptions).forEach((key) => {
          expectedStyle[key] = styleOptions[key];
        });
        expect(style).toEqual(expectedStyle);
      }
    });
  }
);

describe.each(testCases)(
  'test viewer API for mappings of "$name"',
  ({ name, inputs, expectations }) => {
    let viewer;
    beforeEach(() => {
      viewer = new dmv.viewer.VolumeImageViewer({
        client: {},
        metadata: inputs.images,
      });
    });

    afterEach(() => {
      viewer = undefined;
    });

    it('should add and remove mappings', () => {
      expect(viewer.getAllParameterMappings().length).toEqual(0);
      inputs.maps.forEach((metadata) => {
        viewer.addParameterMappings(metadata);
      });
      const mappings = viewer.getAllParameterMappings();
      expect(mappings.length).toEqual(
        Object.keys(expectations.mappings).length
      );
      viewer.removeAllParameterMappings();
      expect(viewer.getAllParameterMappings().length).toEqual(0);
    });

    it('should change mapping visibility', () => {
      inputs.maps.forEach((metadata) => {
        viewer.addParameterMappings(metadata);
      });
      const mappingUIDs = Object.keys(expectations.mappings);
      if (mappingUIDs.length > 0) {
        const index = 0;
        const uid = mappingUIDs[index];
        let isVisible;
        viewer.showParameterMapping(uid);
        isVisible = viewer.isParameterMappingVisible(uid);
        expect(isVisible).toBeTruthy();
        viewer.hideParameterMapping(uid);
        isVisible = viewer.isParameterMappingVisible(uid);
        expect(isVisible).toBeFalsy();
        viewer.showParameterMapping(uid);
        isVisible = viewer.isParameterMappingVisible(uid);
        expect(isVisible).toBeTruthy();
      }
    });

    it('should return default mapping style', () => {
      inputs.maps.forEach((metadata) => {
        viewer.addParameterMappings(metadata);
        const uid =
          metadata[0].PerFrameFunctionalGroupsSequence[0]
            .RealWorldValueMappingSequence[0].TrackingUID;
        const style = viewer.getParameterMappingStyle(uid);
        const expectedStyle = expectations.mappings[uid].style;
        expect(style.opacity).toEqual(expectedStyle.opacity);
        expect(style.paletteColorLookupTable.data).toEqual(
          expectedStyle.paletteColorLookupTable.data
        );
      });
    });

    it('should set mapping style', () => {
      inputs.maps.forEach((metadata) => {
        viewer.addParameterMappings(metadata);
      });
      const mappingUIDs = Object.keys(expectations.mappings);
      if (mappingUIDs.length > 0) {
        const index = 0;
        const uid = mappingUIDs[index];
        const styleOptions = {
          opacity: 0.7,
        };
        viewer.setParameterMappingStyle(uid, styleOptions);
        const style = viewer.getParameterMappingStyle(uid);
        const expectedStyle = Object.assign({}, style);
        Object.keys(styleOptions).forEach((key) => {
          expectedStyle[key] = styleOptions[key];
        });
        expect(style).toEqual(expectedStyle);
      }
    });
  }
);
