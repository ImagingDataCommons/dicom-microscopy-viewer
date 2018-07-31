# dicom-microscopy-viewer
Web-based viewer for [DICOM Visible Light Whole Slide Microscopy Images](http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_A.32.8.html).


## Install

The `dicom-microscopy-viewer` package can be installed via [npm](https://www.npmjs.com/):

```None
npm install dicom-microscopy-viewer
```

## Build

The library can be build locally with [rollup](https://rollupjs.org/guide/en):

```None
git clone https://github.com/dcmjs-org/dicom-microscopy-viewer ~/dicom-microscopy-viewer
cd ~/dicom-microscopy-viewer
npm install
npm run build
```

## Usage

```js
const url = 'http://localhost:8080/dicomweb';
const client = new DICOMwebClient.api.DICOMwebClient({url});
const studyInstanceUID = '1.2.3.4';
const seriesInstanceUID = '1.2.3.5';
const viewer = new DICOMMicroscopyViewer.api.MicroscopyViewer({
  client,
  studyInstanceUID,
  seriesInstanceUID
});
viewer.render({container: "viewport"});
```

## Status

**This is work-in-progress and should not be used in clinical practice.**

The viewer allows visualization of *VL Whole Slide Microscopy Image* datasets stored in a [DICOMweb](https://www.dicomstandard.org/dicomweb/) compatible archive.
It leverages [dicomweb-client](https://github.com/dcmjs-org/dicomweb-client) to retrieve data from the archive.

### Limitations

Currently, the viewer only supports

* baseline JPEG with transfer syntax "1.2.840.10008.1.2.4.50"
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

