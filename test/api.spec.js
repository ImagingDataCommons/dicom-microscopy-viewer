const chai = require('chai');
const assert = require('assert');

chai.should();

const metadata = require('./data/metadata.json');

const dicomMicroscopyViewer = require('../build/dicom-microscopy-viewer.js');

describe('dicomMicroscopyViewer.api.VLWholeSlideMicroscopyImageViewer', ()=> {

    let viewer;

    before(() => {
        viewer = new dicomMicroscopyViewer.api.VLWholeSlideMicroscopyImageViewer({
            client: 'foo',
            metadata: metadata,
            useWebGL: false
        });
    })

    it('should return {} if there is no drawing', () => {
        assert.deepEqual(viewer.getROI(0), {});
    })

    it('should create a Circle ROI and return it back successfuly', () => {
        
        let properties = {};
        const circle = new dicomMicroscopyViewer.scoord3d.Circle([1000, 1000, 1], 100);
        const roi = new dicomMicroscopyViewer.roi.ROI({scoord3d : circle, properties});
        viewer.addROI(roi);
        assert.deepEqual(viewer.getROI(0).scoord3d.coordinates, circle.coordinates);
    })
});
