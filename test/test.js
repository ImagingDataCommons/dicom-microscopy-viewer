const chai = require('chai');
chai.should();

const metadata = require('./data/testCase1.json');

const dmv = require('../build/dicom-microscopy-viewer.js');

describe('dmv.viewer.VolumeImageViewer', function() {

  const viewer = new dmv.viewer.VolumeImageViewer({
    client: 'foo',
    metadata: metadata,
    useWebGL: false
  });

});
