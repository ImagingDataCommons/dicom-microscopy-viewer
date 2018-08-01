const chai = require('chai');
chai.should();

const dicomMicroscopyViewer = require('../build/dicom-microscopy-viewer.js');
const viewer = new dicomMicroscopyViewer.api.DICOMMicroscopyViewer({
  client: 'foo',
  studyInstanceUID: '1.2.3.4',
  seriesInstanceUID: '1.2.3.5'
});
describe('viewer', function() {
  it('should have property "map"', function() {
    viewer.should.have.property('map').equal(null);
  });
  it('should have property "client"', function() {
    viewer.should.have.property('client').equal('foo');
  });
  it('should have property "studyInstanceUID"', function() {
    viewer.should.have.property('studyInstanceUID').equal('1.2.3.4');
  });
  it('should have property "seriesInstanceUID"', function() {
    viewer.should.have.property('seriesInstanceUID').equal('1.2.3.5');
  });
});
