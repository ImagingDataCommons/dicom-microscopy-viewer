const chai = require('chai');
chai.should();

const metadata = require('./data/testCase1.json');

const dicomMicroscopyViewer = require('../build/dicom-microscopy-viewer.js');

describe('dicomMicroscopyViewer.api.VLWholeSlideMicroscopyImageViewer', function() {

  const viewer = new dicomMicroscopyViewer.api.VLWholeSlideMicroscopyImageViewer({
    client: 'foo',
    metadata: metadata,
    useWebGL: false
  });

});
