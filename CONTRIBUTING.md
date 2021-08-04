# Contributing to DICOM Microscopy Viewer

## Design considerations and implementation details

The library is intended to provide a lightweight and standard-compliant viewer for microscopy images in DICOM format.

The viewer relies on [Openlayers](http://openlayers.org/) for rendering pyramid images and dynamically retrieves pyramid tiles (image frames) via [DICOMweb WADO-RS](https://www.dicomstandard.org/dicomweb/retrieve-wado-rs-and-wado-uri/) using [dicomweb-client](https://github.com/mghcomputationalpathology/dicomweb-client).
However, the viewer API fully abstracts the underlying rendering library and doesn't expose the lower level Openlayers API directly, such that another rendering library could in principle be used in the future if this would be of advantage.

A central design choice was to not expose any Openlayers objects or functions via the public API, but always provide an abstraction layer.
Any functions or methods that receive arguments with Openlayers types as input or return values with Openlayers types as output shall be kept private and shall not be exposed at the package level, i.e., not exported in the main `dicom-microscopy-viewer.js` file.
Private functions shall be named with a leading underscore (e.g., `_myPrivateFunction`) and include the [@private JSDoc tag](https://jsdoc.app/tags-private.html) in their docstrings.

## Coding style

The library is implemented in JavaScript using the [6th Edition of the ECMAScript Language Specification (ES6)](https://262.ecma-international.org/6.0/) or later.
Source code is linted using [standard](https://github.com/standard/standard) (based on [eslint](https://eslint.org/)).

Use the following command to identify potential coding style and type annotation violations:

    $ npm run lint

Docstrings are written in [JSDoc](https://jsdoc.app/) format:

```js
/**
 * Check values.
 *
 * @param options - Options
 * @param {string} options.foo - One option
 * @param {number} options.bar - Another option
 * @returns {boolean} The return value
 */
const checkValues = (options) => {}
```

Each function or method docstring shall include the [@param tag](https://jsdoc.app/tags-param.html) and [@returns tag](https://jsdoc.app/tags-returns.html) and they shall specify the type of parameters and return values, respectively.
