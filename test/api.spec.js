const chai = require('chai');
const assert = require('assert');
const roi = require

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

    it('should return 512 rows and 512 cols based on the mock data', () => {
        assert.equal(viewer.pyramid[0].rows, 512);
        assert.equal(viewer.pyramid[0].columns, 512);
    })

    it('should return {} if there is no drawing', () => {
        assert.deepEqual(viewer.getROI(0), {});
    })

    it('should add a ROI and return it back as totalPixelMatrix', () => {
        const coordinates = [
            [20967.16433027939, 16904.918818364204],
            [20967.16433027939, 16899.356324511322],
            [18802.104222888596, 17666.917976278484]
        ];
        const scoord = {
            coordinates: coordinates,
            graphicData : coordinates,
            graphicType: "POLYLINE"
        };        
        let properties = {};
        const roi = new dicomMicroscopyViewer.roi.ROI({scoord, properties});
        viewer.addROI(roi);
        assert.deepEqual(viewer.getROI(0).coordinateSystem, 'totalPixelMatrix');
        assert.deepEqual(viewer.getROI(0).scoord.coordinates, coordinates);
    })
});
