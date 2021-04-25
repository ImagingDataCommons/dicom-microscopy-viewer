const chai = require('chai');
const assert = require('assert');

chai.should();

const testCase1 = require('./data/testMultiChannel1.json');
const testCase2 = require('./data/testMultiChannel2.json');
const testCase3 = require('./data/testMultiChannel3.json');
const metadata = [testCase1[0], testCase2[0], testCase3[0]];

const dmv = require('../build/dicom-microscopy-viewer.js');

describe('dmv.viewer.VolumeImageViewer', ()=> {

  var viewer;
  const BIOne = new dmv.metadata.BlendingInformation(
    opticalPathIdentifier = `1`, 
    color = [0.,0.5,0.5],
    opacity = 1.0,
    thresholdValues = [125., 255.],
    visible = true,
  );
  const BITwo = new dmv.metadata.BlendingInformation(
    opticalPathIdentifier = `2`, 
    color = [0.5, 0.5, 0.],
    opacity = 1.0,
    thresholdValues = [0., 255.],
    visible = true,
  );
  const BIThree = new dmv.metadata.BlendingInformation(
    opticalPathIdentifier = `3`,
    color = [1, 0., 0.],
    opacity = 1.0,
    thresholdValues = [0., 255.],
    visible = true,
  );
  
  viewer = new dmv.api.VLWholeSlideMicroscopyImageViewer({
    client: 'test',
    metadata: metadata,
    blendingInformation: [BIOne, BITwo, BIThree],
  });

  it('sets optical path color', () => {
    const color = [1.,0.,0.];
    const blendingInformation = {
      color : color,
      opticalPathID : `1`,
    };

    viewer.setBlendingInformation(blendingInformation)
    assert.deepEqual(color, viewer.getBlendingInformation(blendingInformation.opticalPathID).color);
  })

  it('sets optical path thresholdValues', () => {
    const thresholdValues = [0., 255.];
    const blendingInformation = {
      thresholdValues : thresholdValues,
      opticalPathID : `1`,
    };

    viewer.setBlendingInformation(blendingInformation)
    assert.deepEqual(thresholdValues, viewer.getBlendingInformation(blendingInformation.opticalPathID).thresholdValues);
  })

  it('sets optical path opacity', () => {
    const opacity = 0.5;
    const blendingInformation = {
      opacity : opacity,
      opticalPathID : `1`,
    };

    viewer.setBlendingInformation(blendingInformation)
    assert.deepEqual(opacity, viewer.getBlendingInformation(blendingInformation.opticalPathID).opacity);
  })

  it('hides optical path', () => {
    const opticalPathID = `1`;

    viewer.hideOpticalPath(opticalPathID)
    assert.deepEqual(false, viewer.getBlendingInformation(opticalPathID).visible);
  })

  it('shows optical path', () => {
    const opticalPathID = `1`;

    viewer.showOpticalPath(opticalPathID)
    assert.deepEqual(true, viewer.getBlendingInformation(opticalPathID).visible);
  })

  it('throws an Error if activates optical path identifier 4', () => {
    const opticalPathID = `4`;

    chai.expect(() => {
      viewer.activateOpticalPath(opticalPathID);
    }).to.throw(
      'No OpticalPath with ID ' + opticalPathID + ' has been found.'
    );
  });

  it('throws an Error if deactivates optical path identifier 4', () => {
    const opticalPathID = `4`;

    chai.expect(() => {
      viewer.deactivateOpticalPath(opticalPathID);
    }).to.throw(
      'No OpticalPath with ID ' + opticalPathID + ' has been found.'
    );
  });

  it('throws an Error if activates optical path identifier 3 (already activated)', () => {
    const opticalPathID = `3`;

    chai.expect(() => {
      viewer.activateOpticalPath(opticalPathID);
    }).to.throw(
      'OpticalPath ' + opticalPathID + ' already activated'
    );
  });

  it('throws an Error if deactivates optical path identifier 3 twice', () => {
    const opticalPathID = `3`;
    viewer.deactivateOpticalPath(opticalPathID);

    chai.expect(() => {
      viewer.deactivateOpticalPath(opticalPathID);
    }).to.throw(
      'OpticalPath ' + opticalPathID + ' already deactivated'
    );
  });
});
