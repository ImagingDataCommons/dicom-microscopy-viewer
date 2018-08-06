[![Build Status](https://travis-ci.com/dcmjs-org/dicom-microscopy-viewer.svg?branch=master)](https://travis-ci.com/dcmjs-org/dicom-microscopy-viewer)

# DICOM Microscopy Viewer
Vanilla JS library for web-based visualization of [DICOM VL Whole Slide Microscopy Image](http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_A.32.8.html) datasets.
The library relies on [Openlayers](http://openlayers.org/) for rendering pyramid images and retrieves pyramid tiles (image frames) using [DICOMweb WADO-RS](https://www.dicomstandard.org/dicomweb/retrieve-wado-rs-and-wado-uri/). 


## Installation

Install the [dicom-microscopy-viewer](https://www.npmjs.com/package/dicom-microscopy-viewer) package using the `npm` package manager:

```None
npm install dicom-microscopy-viewer
```

## Building and testing

Build and test code locally:

```None
git clone https://github.com/dcmjs-org/dicom-microscopy-viewer ~/dicom-microscopy-viewer
cd ~/dicom-microscopy-viewer
npm install
npm run build
npm test
```

We use [rollup](https://rollupjs.org/guide/en) for bundling and [mochify](https://github.com/mantoni/mochify.js) for testing (based on [mocha](https://mochajs.org/) and [chai](http://www.chaijs.com/)).


## Usage

The viewer can be embedded in any website.

To this end

* Create an instance of the `DICOMMicroscopy` viewer. The constructor requires an instance of `DICOMwebClient` for retrieving frames from the archive as well as the metadata for each DICOM image instance formatted according to the [
DICOM JSON Model](http://dicom.nema.org/medical/dicom/current/output/chtml/part18/sect_F.2.html).

* Call the `render()` method, passing it the HTML element or the name of the element, which shall contain the viewport.


```js
const url = 'http://localhost:8080/dicomweb';
const client = new DICOMwebClient.api.DICOMwebClient({url});
const studyInstanceUID = '1.2.3.4';
const seriesInstanceUID = '1.2.3.5';
const searchInstanceOptions = {
  studyInstanceUID,
  seriesInstanceUID
};
client.searchForInstances(searchInstanceOptions).then((instances) => {
  const promises = []
  for (let i = 0; i < instances.length; i++) {
    const sopInstanceUID = instances[i]["00080018"]["Value"][0];
    const retrieveInstanceOptions = {
      studyInstanceUID,
      seriesInstanceUID,
      sopInstanceUID,
    };
    const promise = client.retrieveInstanceMetadata(retrieveInstanceOptions).then(metadata => {
      const imageType = metadata[0]["00080008"]["Value"];
      if (imageType[2] === "VOLUME") {
        return(metadata[0]);
      }
    });
    promises.push(promise);
  }
  return(Promise.all(promises));
}).then(metadata => {
  const viewer = new DICOMMicroscopyViewer.api.DICOMMicroscopyViewer({
    client,
    metadata
  });
  viewer.render({container: 'activeViewport'});
});
```

## Status

**This is work-in-progress and should not be used in clinical practice.**

The viewer allows visualization of *VL Whole Slide Microscopy Image* datasets stored in a [DICOMweb](https://www.dicomstandard.org/dicomweb/) compatible archive.
It leverages the [dicomweb-client](https://github.com/dcmjs-org/dicomweb-client) JavaScript library to retrieve data from the archive.

### Limitations

Currently, the viewer only supports

* baseline JPEG compressed data (transfer syntax "1.2.840.10008.1.2.4.50")
* brightfield illumination (no fluorescence)
* 2D images (no z-stacks)

## Support

The developers gratefully acknowledge their reseach support:
* Open Health Imaging Foundation ([OHIF](http://ohif.org))
* Quantitative Image Informatics for Cancer Research ([QIICR](http://qiicr.org))
* [Radiomics](http://radiomics.io)
* The [Neuroimage Analysis Center](http://nac.spl.harvard.edu)
* The [National Center for Image Guided Therapy](http://ncigt.org)
* The [MGH & BWH Center for Clinical Data Science](https://www.ccds.io/)

