[![Build Status](https://travis-ci.com/mghcomputationalpathology/dicom-microscopy-viewer.svg?branch=master)](https://travis-ci.com/mghcomputationalpathology/dicom-microscopy-viewer)

# DICOM Microscopy Viewer

Vanilla JS library for web-based visualization of [DICOM VL Whole Slide Microscopy Image](http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_A.32.8.html) datasets.

The viewer allows visualization of slide microscopy images stored in a [DICOMweb](https://www.dicomstandard.org/dicomweb/) compatible archive.
It leverages the [dicomweb-client](https://github.com/dcmjs-org/dicomweb-client) JavaScript library to retrieve data from the archive.

## Features

* Display of different image types: `VOLUME`, `OVERVIEW`, `LABEL`
* Annotation of regions of interest (ROI) as vector graphics based on 3-dimensional spatial coordinates (SCOORD3D): `POINT`, `MULTIPOINT`, `POLYLINE`, `POLYGON`, `ELLIPSE`, `ELLIPSOID`
* Assembly of concatenations
* Decoding of compressed pixel data, supporting baseline JPEG, JPEG 2000 and JPEG-LS codecs
* Additive blending and coloring of monochromatic images of multiple optical paths (channels), supporting highly-multiplexed immunofluorescence imaging

## Live demo

Check out the online examples at [microscopy.dcmjs.org](https://microscopy.dcmjs.org/).

## Documentation

The online Application Programming Interface (API) documentation is available at [mghcomputationalpathology.github.io/dicom-microscopy-viewer](https://mghcomputationalpathology.github.io/dicom-microscopy-viewer/).

## Getting started

Take a look at the examples in the `/examples` directory.
They are also available online at [microscopy.dcmjs.org](https://microscopy.dcmjs.org/).

### Basic usage

```html
<script type="text/javascript" src="https://unpkg.com/dicom-microscopy-viewer"></script>
```

The viewer can be embedded in any website, one only needs to

* Create an instance of the `viewer.VolumeViewer`. The constructor requires an instance of `DICOMwebClient` for retrieving frames from the archive as well as the metadata for each DICOM image instance formatted according to the [
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
  const viewer = new DICOMMicroscopyViewer.viewer.VolumeViewer({
    client,
    metadata
  });
  viewer.render({container: 'viewport'});
});
```

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

## Installation

Install the [dicom-microscopy-viewer](https://www.npmjs.com/package/dicom-microscopy-viewer) package using the `npm` package manager:

```None
npm install dicom-microscopy-viewer
```

## Building & Testing

Build code locally:

```None
git clone https://github.com/mghcomputationalpathology/dicom-microscopy-viewer ~/dicom-microscopy-viewer
cd ~/dicom-microscopy-viewer
npm install
npm run build
```

test code locally:

```None
git clone https://github.com/mghcomputationalpathology/dicom-microscopy-viewer ~/dicom-microscopy-viewer
cd ~/dicom-microscopy-viewer
npm install
npm test
```

We use [rollup](https://rollupjs.org/guide/en) for bundling and [Jest](https://github.com/facebook/jest) for testing.

Build the documentation:

```None
npm run generateDocs
```

## Support

The developers gratefully acknowledge their reseach support:
* [Open Health Imaging Foundation (OHIF)](http://ohif.org)
* [Quantitative Image Informatics for Cancer Research (QIICR)](http://qiicr.org)
* [Radiomics](http://radiomics.io)
* [Imaging Data Commons (IDC)](https://datacommons.cancer.gov/repository/imaging-data-commons)
* [Neuroimage Analysis Center](http://nac.spl.harvard.edu)
* [National Center for Image Guided Therapy](http://ncigt.org)
* [MGH & BWH Center for Clinical Data Science (CCDS)](https://www.ccds.io/)
