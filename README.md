[![Build Status](https://github.com/imagingdatacommons/dicom-microscopy-viewer/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/imagingdatacommons/dicom-microscopy-viewer/actions)
[![NPM version](https://badge.fury.io/js/dicom-microscopy-viewer.svg)](http://badge.fury.io/js/dicom-microscopy-viewer)
![NPM downloads per month](https://img.shields.io/npm/dm/dicom-microscopy-viewer?color=blue)

# DICOM Microscopy Viewer

Vanilla JS library for web-based visualization of [DICOM VL Whole Slide Microscopy Image](http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_A.32.8.html) datasets and derived information.

The viewer allows visualization of slide microscopy images stored in a [DICOMweb](https://www.dicomstandard.org/dicomweb/) compatible archive.
It leverages the [dicomweb-client](https://github.com/dcmjs-org/dicomweb-client) JavaScript library to retrieve data from the archive.

## Features

* Display of different image types: `VOLUME`/`THUMBNAIL`, `OVERVIEW`, `LABEL`
* Annotation of regions of interest (ROI) as vector graphics based on 3-dimensional spatial coordinates (SCOORD3D): `POINT`, `MULTIPOINT`, `POLYLINE`, `POLYGON`, `ELLIPSE`, `ELLIPSOID`
* Assembly of concatenations
* Decoding of compressed pixel data, supporting baseline JPEG, JPEG 2000, and JPEG-LS codecs
* Correction of color images using ICC profiles
* Additive blending and coloring of monochromatic images of multiple optical paths (channels), supporting highly-multiplexed immunofluorescence imaging
* Overlay of image analysis results in the form of [DICOM Segmentation](https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_A.51.html), [Parametric Map](https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_A.75.html), [Comprehensive 3D SR](https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_A.35.13.html), or [Microscopy Bulk Simple Annotations](https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_A.87.html)

## Documentation

Documentation of the JavaScript Application Programming Interface (API) is available online at [imagingdatacommons.github.io/dicom-microscopy-viewer](https://imagingdatacommons.github.io/dicom-microscopy-viewer/).

For information about configuring DICOMweb request headers (e.g., for authentication), see [DICOMweb Headers Configuration](docs/DICOMWEB_HEADERS.md).

## Getting started

Note that the *dicom-microscopy-viewer* package is **not** a viewer application, it is a library to build viewer applications.

Below is an example for the most basic usage: a web page that displays a collection of DICOM VL Whole Slide Microscopy Image instances of a digital slide.
For more advanced usage, take a look at the [Slim](https://github.com/imagingdatacommons/slim) viewer.

## Packaging
 
 The library is packaged as two different builds, one using dynamic import, and the other bundling into one 
 larger library.  The dynamic import version uses a public path of `/dicom-microscopy-viewer/` so that they can be used by simply adding an alias to the appropriate version, and then deploying that version.  In a straight web application, this can be loaded as:
 
 ```javascript
    const DICOMMicroscopyViewer = (await('/dicom-microscopy-viewer/dicomMicroscopyViewer.min.js')).default
 ```
 
 The point of using the sub-directory here is to isolate the dependencies that unique to `dicom-microscopy-viewer`.
 
 
### Basic usage

The viewer can be embedded in any website, one only needs to

* Create an instance of [VolumeImageViewer](https://imagingdatacommons.github.io/dicom-microscopy-viewer/viewer.VolumeImageViewer.html). The constructor requires an instance of `DICOMwebClient` for retrieving frames from the archive as well as the metadata for each DICOM image as an instance of [VLWholeSlideMicroscopyImage](https://imagingdatacommons.github.io/dicom-microscopy-viewer/metadata.VLWholeSlideMicroscopyImage.html).

* Call the `render()` method, passing it the HTML element (or the name of the element), which shall contain the viewport.

```js
import * as DICOMMicroscopyViewer from 'dicom-microscopy-viewer';
import * as DICOMwebClient from 'dicomweb-client';

// Construct client instance
const client = new DICOMwebClient.api.DICOMwebClient({
  url: 'http://localhost:8080/dicomweb'
});

// Retrieve metadata of a series of DICOM VL Whole Slide Microscopy Image instances
const retrieveOptions = {
  studyInstanceUID: '1.2.3.4',
  seriesInstanceUID: '1.2.3.5'
};
client.retrieveSeriesMetadata(retrieveOptions).then((metadata) => {
  // Parse, format, and filter metadata
  const volumeImages = []
  metadata.forEach(m => {
    const image = new DICOMMicroscopyViewer.metadata.VLWholeSlideMicroscopyImage({
      metadata: m
    })
    const imageFlavor = image.ImageType[2]
    if (imageFlavor === 'VOLUME' || imageFlavor === 'THUMBNAIL') {
      volumeImages.push(image)
    }
  })

  // Construct viewer instance
  const viewer = new DICOMMicroscopyViewer.viewer.VolumeViewer({
    client,
    metadata: volumeImages
  });

  // Render viewer instance in the "viewport" HTML element
  viewer.render({ container: 'viewport' });
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

## Development & Testing

We use [Babel](https://babeljs.io/) to compile (transpile), [webpack](https://webpack.js.org/) to bundle, and [Jest](https://github.com/facebook/jest) to test JavaScript code.

Get the source code by cloning the git repository:

```None
git clone https://github.com/imagingdatacommons/dicom-microscopy-viewer
cd dicom-microscopy-viewer
```

Install dependencies and build the package:

```None
npm install
npm run build
```

Run tests:

```None
npm run test
```

Build the API documentation:

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

## Acknowledgments

This software is maintained by the Imaging Data Commons (IDC) team, which has been funded in whole or
in part with Federal funds from the NCI, NIH, under task order no. HHSN26110071
under contract no. HHSN261201500003l.

NCI Imaging Data Commons (IDC) (https://imaging.datacommons.cancer.gov/) is a cloud-based environment 
containing publicly available cancer imaging data co-located with analysis and exploration tools and resources. 
IDC is a node within the broader NCI Cancer Research Data Commons (CRDC) infrastructure that provides secure 
access to a large, comprehensive, and expanding collection of cancer research data.

Learn more about IDC from this publication:

> Fedorov, A., Longabaugh, W. J. R., Pot, D., Clunie, D. A., Pieper, S. D.,
> Gibbs, D. L., Bridge, C., Herrmann, M. D., Homeyer, A., Lewis, R., Aerts, H.
> J. W., Krishnaswamy, D., Thiriveedhi, V. K., Ciausu, C., Schacherer, D. P.,
> Bontempi, D., Pihl, T., Wagner, U., Farahani, K., Kim, E. & Kikinis, R.
> _National Cancer Institute Imaging Data Commons: Toward Transparency,
> Reproducibility, and Scalability in Imaging Artificial Intelligence_.
> RadioGraphics (2023). https://doi.org/10.1148/rg.230180
