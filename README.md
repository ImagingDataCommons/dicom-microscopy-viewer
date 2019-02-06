[![Build Status](https://travis-ci.com/dcmjs-org/dicom-microscopy-viewer.svg?branch=master)](https://travis-ci.com/dcmjs-org/dicom-microscopy-viewer)

# DICOM Microscopy Viewer
Vanilla JS library for web-based visualization of [DICOM VL Whole Slide Microscopy Image](http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_A.32.8.html) datasets.

## Motivation and implementation
The library is intended to provide a lightweight and standard-compliant viewer for microscopy images in DICOM format.
The viewer relies on [Openlayers](http://openlayers.org/) for rendering pyramid images and dynamically retrieves pyramid tiles (image frames) via [DICOMweb WADO-RS](https://www.dicomstandard.org/dicomweb/retrieve-wado-rs-and-wado-uri/) using [dicomweb-client](https://github.com/dcmjs-org/dicomweb-client).
However, the viewer API fully abstracts the underlying rendering library and doesn't expose the lower level Openlayers API directly, such that another rendering library could in principle be used in the future if this would be of advantage.

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

```html
<script type="text/javascript" src="https://unpkg.com/dicom-microscopy-viewer"></script>
```

The viewer can be embedded in any website, one only needs to

* Create an instance of the `VLWholeSlideMicroscopyImageViewer`. The constructor requires an instance of `DICOMwebClient` for retrieving frames from the archive as well as the metadata for each DICOM image instance formatted according to the [
DICOM JSON Model](http://dicom.nema.org/medical/dicom/current/output/chtml/part18/sect_F.2.html).

* Call the `render()` method, passing it the HTML element (or the name of the element), which shall contain the viewport.


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
  metadata = metadata.filter(m => m);
  const viewer = new DICOMMicroscopyViewer.api.VLWholeSlideMicroscopyImageViewer({
    client,
    metadata
  });
  viewer.render({container: 'viewport'});
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

## Citation

Please cite the following article when using the viewer for scientific studies: [Herrmann et al. J Path Inform. 2018](http://www.jpathinformatics.org/article.asp?issn=2153-3539;year=2018;volume=9;issue=1;spage=37;epage=37;aulast=Herrmann):

```None
@article{jpathinform-2018-9-37,
    Author={
        Herrmann, M. D. and Clunie, D. A. and Fedorov A. and Doyle, S. W. and Pieper, S. and
        Klepeis, V. and Le, L. P. and Mutter, G. L. and Milstone, D. S. and Schultz, T. J. and
        Kikinis, R. and Kotecha, G. K. and Hwang, D. H. and Andriole, K, P. and Iafrate, A. J. and
        Brink, J. A. and Boland, G. W. and Dreyer, K. J. and Michalski, M. and
        Golden, J. A. and Louis, D. N. and Lennerz, J. K.
    },
    Title={Implementing the {DICOM} standard for digital pathology},
    Journal={Journal of Pathology Informatics},
    Year={2018},
    Number={1},
    Volume={9},
    Number={37}
}

```

## Support

The developers gratefully acknowledge their reseach support:
* Open Health Imaging Foundation ([OHIF](http://ohif.org))
* Quantitative Image Informatics for Cancer Research ([QIICR](http://qiicr.org))
* [Radiomics](http://radiomics.io)
* The [Neuroimage Analysis Center](http://nac.spl.harvard.edu)
* The [National Center for Image Guided Therapy](http://ncigt.org)
* The [MGH & BWH Center for Clinical Data Science](https://www.ccds.io/)

