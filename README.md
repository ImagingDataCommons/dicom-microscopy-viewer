[![Build Status](https://github.com/imagingdatacommons/dicom-microscopy-viewer/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/imagingdatacommons/dicom-microscopy-viewer/actions)
[![NPM version](https://badge.fury.io/js/dicom-microscopy-viewer.svg)](https://www.npmjs.com/package/dicom-microscopy-viewer)
[![NPM downloads per month](https://img.shields.io/npm/dm/dicom-microscopy-viewer?color=blue)](https://www.npmjs.com/package/dicom-microscopy-viewer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# DICOM Microscopy Viewer

Vanilla JS library for web-based visualization of [DICOM VL Whole Slide Microscopy Image](https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_A.32.8.html) datasets and derived information.

The viewer visualizes slide microscopy images stored in a [DICOMweb](https://www.dicomstandard.org/dicomweb/)-compatible archive. It uses the [dicomweb-client](https://github.com/dcmjs-org/dicomweb-client) JavaScript library to retrieve data from the archive.

> **Note:** The `dicom-microscopy-viewer` package is a **library** for building viewer applications, not a standalone viewer application. For a full application built on this library, see [Slim](https://github.com/ImagingDataCommons/slim).

## Table of Contents

- [Features](#features)
- [Documentation](#documentation)
- [Installation](#installation)
- [Getting started](#getting-started)
  - [Packaging](#packaging)
  - [Basic usage](#basic-usage)
  - [Reading tiles without the viewer](#reading-tiles-without-the-viewer)
  - [Using with Viv / deck.gl](#using-with-viv--deckgl)
- [Development](#development)
- [Related projects](#related-projects)
- [Contributing](#contributing)
- [Citation](#citation)
- [Support](#support)
- [Acknowledgments](#acknowledgments)
- [License](#license)

## Features

- Display of different image types: `VOLUME` / `THUMBNAIL`, `OVERVIEW`, `LABEL`
- Annotation of regions of interest (ROI) as vector graphics based on 3-dimensional spatial coordinates (SCOORD3D): `POINT`, `MULTIPOINT`, `POLYLINE`, `POLYGON`, `ELLIPSE`, `ELLIPSOID`
- Assembly of concatenations
- Decoding of compressed pixel data, supporting baseline JPEG, JPEG 2000, JPEG-LS, High-Throughput JPEG 2000 (HTJ2K), and JPEG XL codecs
- Correction of color images using ICC profiles
- Additive blending and coloring of monochromatic images of multiple optical paths (channels), supporting highly multiplexed immunofluorescence imaging
- Overlay of image analysis results in the form of [DICOM Segmentation](https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_A.51.html), [Parametric Map](https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_A.75.html), [Comprehensive 3D SR](https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_A.35.13.html), or [Microscopy Bulk Simple Annotations](https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_A.87.html)

## Documentation

API documentation is available online at [imagingdatacommons.github.io/dicom-microscopy-viewer](https://imagingdatacommons.github.io/dicom-microscopy-viewer/).

## Installation

Install the [dicom-microscopy-viewer](https://www.npmjs.com/package/dicom-microscopy-viewer) package using your preferred package manager:

```bash
pnpm add dicom-microscopy-viewer
```

## Getting started

Below is an example of the most basic usage: a web page that displays a collection of DICOM VL Whole Slide Microscopy Image instances of a digital slide. For more advanced usage, see the [Slim](https://github.com/ImagingDataCommons/slim) viewer.

### Packaging

The library is packaged as two builds: one using dynamic import, and another bundling into a single larger library.

The dynamic import version uses a public path of `/dicom-microscopy-viewer/` so it can be used by adding an alias to the appropriate version and then deploying that version. In a plain web application, this can be loaded as:

```js
const DICOMMicroscopyViewer = (
  await import("/dicom-microscopy-viewer/dicomMicroscopyViewer.min.js")
).default
```

Using a subdirectory isolates the dependencies that are unique to `dicom-microscopy-viewer`.

### Basic usage

The viewer can be embedded in any website. To do so:

1. Create an instance of [VolumeImageViewer](https://imagingdatacommons.github.io/dicom-microscopy-viewer/viewer.VolumeImageViewer.html). The constructor requires an instance of `DICOMwebClient` for retrieving frames from the archive, as well as the metadata for each DICOM image as an instance of [VLWholeSlideMicroscopyImage](https://imagingdatacommons.github.io/dicom-microscopy-viewer/metadata.VLWholeSlideMicroscopyImage.html).
2. Call the `render()` method, passing it the HTML element (or the name of the element) that should contain the viewport.

```js
import * as DICOMMicroscopyViewer from "dicom-microscopy-viewer"
import * as DICOMwebClient from "dicomweb-client"

// Construct client instance
const client = new DICOMwebClient.api.DICOMwebClient({
  url: "http://localhost:8080/dicomweb",
})

// Retrieve metadata of a series of DICOM VL Whole Slide Microscopy Image instances
const retrieveOptions = {
  studyInstanceUID: "1.2.3.4",
  seriesInstanceUID: "1.2.3.5",
}
client.retrieveSeriesMetadata(retrieveOptions).then((metadata) => {
  // Parse, format, and filter metadata
  const volumeImages = []
  metadata.forEach((m) => {
    const image = new DICOMMicroscopyViewer.metadata.VLWholeSlideMicroscopyImage({
      metadata: m,
    })
    const imageFlavor = image.ImageType[2]
    if (imageFlavor === "VOLUME" || imageFlavor === "THUMBNAIL") {
      volumeImages.push(image)
    }
  })

  // Construct viewer instance
  const viewer = new DICOMMicroscopyViewer.viewer.VolumeImageViewer({
    client,
    metadata: volumeImages,
  })

  // Render viewer instance in the "viewport" HTML element
  viewer.render({ container: "viewport" })
})
```

### Reading tiles without the viewer

Other renderers (for example [deck.gl](https://deck.gl) / [Viv](https://github.com/hms-dbmi/viv)) can reuse the DICOMweb retrieval, frame decoding and ICC color management of this library through `pyramid.VolumeImageReader`. It takes the same `client` and `metadata` as `VolumeImageViewer` but needs neither OpenLayers nor a DOM element.

`VolumeImageReader.fromSeries()` retrieves the series metadata and keeps the VOLUME and THUMBNAIL images, as in the example above:

```js
const reader = await DICOMMicroscopyViewer.pyramid.VolumeImageReader.fromSeries({
  client,
  studyInstanceUID: "1.2.3.4",
  seriesInstanceUID: "1.2.3.5",
  skipThumbnails: true,
})
```

Or construct it from metadata you already have:

```js
const reader = new DICOMMicroscopyViewer.pyramid.VolumeImageReader({
  client,
  metadata: volumeImages,
  // A THUMBNAIL level has a different tile size than the VOLUME levels;
  // skip it when the renderer needs one tile size for all levels (e.g. Viv)
  skipThumbnails: true,
})

// Optical paths (channels), in the same order as viewer.getAllOpticalPaths()
const channels = reader.opticalPaths.map((opticalPath) => opticalPath.identifier)

// Pyramid levels, index 0 is the lowest resolution
const base = reader.levels[reader.levels.length - 1]
console.log(base.totalPixelMatrixColumns, base.tileColumns, base.gridColumns)

// Pixel layout, e.g. { samplesPerPixel: 1, bitsAllocated: 16, arrayType: "Uint16Array", ... }
const pixelInfo = reader.getPixelInfo(channels[0])

// Base level pixel (column, row) to slide coordinates (millimeter) and back
const [x, y] = DICOMMicroscopyViewer.utils.applyTransform({
  coordinate: [0, 0],
  affine: reader.affine,
})

const controller = new AbortController()
const tile = await reader.getTile({
  opticalPathIdentifier: channels[0],
  level: base.index,
  column: 0,
  row: 0,
  signal: controller.signal, // optional, cancels the request and decoding
})
// tile.pixelArray holds the stored pixel values (native typed array).
// Edge tiles are padded: only tile.validColumns x tile.validRows hold image data.
// Pass crop: true to get edge tiles without the padding instead.

// Release the shared decoding web workers when done
reader.destroy()
```

An aborted `getTile` rejects with `signal.reason` (a `DOMException` named `AbortError` by default); other failures reject with an `Error` whose `cause` is the underlying error, such as the dicomweb-client request error with its `status`. `destroy()` aborts tiles that are still in flight; later `getTile` calls also reject with an `AbortError`.

How much of the work an abort cancels depends on the dicomweb-client version of the `client` you pass in:

- With a version that supports the `request.signal` option, the request that is actually sent is aborted (also when `requestHooks` replace the XMLHttpRequest), it is not reported to the client's `errorInterceptor`, and request hooks receive the signal as `metadata.signal` (e.g. to cancel a scheduled retry).
- With dicomweb-client 0.11, the XMLHttpRequest is aborted and not reported to the `errorInterceptor`, unless a request hook replaces the XMLHttpRequest or re-sends it later (e.g. a retry hook).
- With older versions, which ignore request options, the request still completes in the background; only the promise rejects early.

### Using with Viv / deck.gl

`viv.loadDicomWeb()` loads a series as a [Viv](https://github.com/hms-dbmi/viv) multiscale image, like Viv's own `loadOmeTiff()`. Viv and deck.gl are not dependencies of this library: the returned pixel sources implement Viv's `PixelSource` interface, and tiles are retrieved and decoded with `pyramid.VolumeImageReader`.

```js
import { MultiscaleImageLayer } from "@vivjs/layers"

const { data, metadata } = await DICOMMicroscopyViewer.viv.loadDicomWeb({
  client,
  studyInstanceUID: "1.2.3.4",
  seriesInstanceUID: "1.2.3.5",
})

const layer = new MultiscaleImageLayer({
  loader: data,
  // Channel c is the optical path metadata.opticalPaths[c]
  selections: [{ c: 0 }, { c: 1 }],
  channelsVisible: [true, true],
  contrastLimits: [[0, 4000], [0, 4000]],
  colors: [[0, 0, 255], [0, 255, 0]],
})

// When the image is no longer shown: cancel pending requests and release
// the decoding web workers
// metadata.reader.destroy()
```

- Levels are ordered from highest to lowest resolution and each is half the size of the previous one (rounded up), as Viv requires. Levels that the DICOM pyramid lacks (e.g. when its levels are 4 times apart) are computed from the next higher resolution level, at most `maxSyntheticLevels` (default 2) in a row. A lowest level of more than 16 tiles is not drawn as Viv's background image.
- Monochrome images have one channel per optical path. Color images have one channel with interleaved RGB samples (Viv supports 8 bits per sample).
- Tiles must be square with a power-of-2 size. Edge tiles are cropped to the image, and the pixel spacing is reported as `meta.physicalSizes` (for Viv's scale bar).
- Tiles that Viv no longer needs are cancelled through its abort signals.
- `loadDicomWeb()` also takes the reader's `iccProfilesEnabled` and `iccOutputType` options. To use a reader you already have, call `viv.createPixelSources({ reader })`.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/) `11.9.0` (see `packageManager` in `package.json`)

We use [Babel](https://babeljs.io/) to compile (transpile), [webpack](https://webpack.js.org/) to bundle, and [Jest](https://github.com/facebook/jest) to test JavaScript code.

Get the source code by cloning the git repository:

```bash
git clone https://github.com/ImagingDataCommons/dicom-microscopy-viewer
cd dicom-microscopy-viewer
```

Install dependencies and build the package:

```bash
pnpm install
pnpm run build
```

Run tests:

```bash
pnpm run test
```

Build the API documentation:

```bash
pnpm run generateDocs
```

Useful scripts:

| Command | Description |
| ------- | ----------- |
| `pnpm run build` | Build the library |
| `pnpm run test` | Run the test suite |
| `pnpm run generateDocs` | Generate API documentation |
| `pnpm run lint` | Check for lint issues |
| `pnpm run lint:fix` | Auto-fix lint issues |
| `pnpm run fmt` | Format source code |
| `pnpm run webpack:dynamic-import:watch` | Watch and rebuild the dynamic-import package |

## Related projects

- [Slim](https://github.com/ImagingDataCommons/slim) — interoperable slide microscopy viewer and annotation tool built on this library
- [dicomweb-client](https://github.com/dcmjs-org/dicomweb-client) — JavaScript client for DICOMweb
- [Imaging Data Commons](https://imaging.datacommons.cancer.gov/) — cloud-based environment for publicly available cancer imaging data

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on coding style, documentation, and the development workflow.

## Citation

Please cite the following article when using the viewer for scientific studies: [Herrmann et al. J Path Inform. 2018](http://www.jpathinformatics.org/article.asp?issn=2153-3539;year=2018;volume=9;issue=1;spage=37;epage=37;aulast=Herrmann):

```bibtex
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

The developers gratefully acknowledge their research support:

- [Open Health Imaging Foundation (OHIF)](http://ohif.org)
- [Quantitative Image Informatics for Cancer Research (QIICR)](http://qiicr.org)
- [Radiomics](http://radiomics.io)
- [Imaging Data Commons (IDC)](https://datacommons.cancer.gov/repository/imaging-data-commons)
- [Neuroimage Analysis Center](http://nac.spl.harvard.edu)
- [National Center for Image Guided Therapy](http://ncigt.org)
- [MGH & BWH Center for Clinical Data Science (CCDS)](https://www.ccds.io/)

## Acknowledgments

This software is maintained by the Imaging Data Commons (IDC) team, which has been funded in whole or in part with Federal funds from the NCI, NIH, under task order no. HHSN26110071 under contract no. HHSN261201500003I.

NCI Imaging Data Commons (IDC) (https://imaging.datacommons.cancer.gov/) is a cloud-based environment containing publicly available cancer imaging data co-located with analysis and exploration tools and resources. IDC is a node within the broader NCI Cancer Research Data Commons (CRDC) infrastructure that provides secure access to a large, comprehensive, and expanding collection of cancer research data.

Learn more about IDC from this publication:

> Fedorov, A., Longabaugh, W. J. R., Pot, D., Clunie, D. A., Pieper, S. D., Gibbs, D. L., Bridge, C., Herrmann, M. D., Homeyer, A., Lewis, R., Aerts, H. J. W., Krishnaswamy, D., Thiriveedhi, V. K., Ciausu, C., Schacherer, D. P., Bontempi, D., Pihl, T., Wagner, U., Farahani, K., Kim, E. & Kikinis, R. _National Cancer Institute Imaging Data Commons: Toward Transparency, Reproducibility, and Scalability in Imaging Artificial Intelligence_. RadioGraphics (2023). https://doi.org/10.1148/rg.230180

## License

This project is licensed under the [MIT License](LICENSE).
