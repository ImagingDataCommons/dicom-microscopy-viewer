import {
  formatMetadata,
} from './metadata.js'

const chai = require('chai');
const assert = require('assert');

chai.should();

const testCase1 = require('./data/testCase1.json');
const testCase2 = require('./data/testCase2.json');
const testCase3 = require('./data/testCase3.json');
const testCases = [testCase1, testCase2, testCase3];

const dmv = require('../build/dicom-microscopy-viewer.js');


describe('dmv.viewer.VolumeImageViewer', ()=> {

    console.info(formatMetadata(testCase1).OpticalPathSequence[0].OpticalPathIdentifier);
    var viewer;

    const BIOne = new DICOMMicroscopyViewer.metadata.BlendingInformation(
      opticalPathIdentifier = `35`, 
      color = [0.,0.5,0.5],
      opacity = 1.0,
      thresholdValues = [125., 256.],
      visible = true,
    );
    const BITwo = new DICOMMicroscopyViewer.metadata.BlendingInformation(
      opticalPathIdentifier = `1`, 
      color = [0.5, 0.5, 0.],
      opacity = 1.0,
      thresholdValues = [0., 256.],
      visible = true,
    );
    const BIThree = new DICOMMicroscopyViewer.metadata.BlendingInformation(
      opticalPathIdentifier = `15`,
      color = [1, 0., 0.],
      opacity = 1.0,
      thresholdValues = [0., 256.],
      visible = true,
    );
    
    viewer = new dmv.api.VLWholeSlideMicroscopyImageViewer({
      client: 'test',
      metadata: testCases,
      blendingInformation: [BIOne, BITwo, BIThree],
      blendingImageQuality: 0.8, // value between 0 and 1;
    });



    /*it('should return [] if there is no drawing', () => {
      assert.deepEqual(viewer.getAllROIs(), []);
    })*/



});
