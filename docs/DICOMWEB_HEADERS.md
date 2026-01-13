# DICOMweb Request Headers Configuration

This document explains where and how DICOMweb request headers are configured in the dicom-microscopy-viewer library.

## Overview

The dicom-microscopy-viewer library uses the [dicomweb-client](https://github.com/dcmjs-org/dicomweb-client) library to communicate with DICOMweb servers. HTTP request headers are configured when creating a `DICOMwebClient` instance, which is then passed to the viewer.

## Where Headers are Configured

Headers are configured **outside of the dicom-microscopy-viewer library**, when you instantiate the `DICOMwebClient` in your application code. The viewer receives the configured client instance and uses it for all DICOMweb requests.

### Configuration Location in Your Application

When creating a viewer instance (e.g., `VolumeImageViewer`, `OverviewImageViewer`, or `LabelImageViewer`), you pass a `DICOMwebClient` instance via the `client` or `clientMapping` option. This is where headers are configured.

## How to Configure Headers

### Basic Example

```javascript
import * as DICOMMicroscopyViewer from 'dicom-microscopy-viewer';
import * as DICOMwebClient from 'dicomweb-client';

// Create DICOMwebClient with custom headers
const client = new DICOMwebClient.api.DICOMwebClient({
  url: 'http://localhost:8080/dicomweb',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'Custom-Header': 'custom-value'
  }
});

// The headers configured above will be used for all requests
const retrieveOptions = {
  studyInstanceUID: '1.2.3.4',
  seriesInstanceUID: '1.2.3.5'
};

client.retrieveSeriesMetadata(retrieveOptions).then((metadata) => {
  const volumeImages = metadata.map(m => 
    new DICOMMicroscopyViewer.metadata.VLWholeSlideMicroscopyImage({ metadata: m })
  ).filter(image => {
    const imageFlavor = image.ImageType[2];
    return imageFlavor === 'VOLUME' || imageFlavor === 'THUMBNAIL';
  });

  // Pass the configured client to the viewer
  const viewer = new DICOMMicroscopyViewer.viewer.VolumeImageViewer({
    client,
    metadata: volumeImages
  });

  viewer.render({ container: 'viewport' });
});
```

### Using Client Mapping with Different Headers

If you need to use different headers for different types of DICOM objects (e.g., images vs. annotations), you can use the `clientMapping` option:

```javascript
import * as DICOMMicroscopyViewer from 'dicom-microscopy-viewer';
import * as DICOMwebClient from 'dicomweb-client';

// Client for image data with specific headers
const imageClient = new DICOMwebClient.api.DICOMwebClient({
  url: 'http://images.example.com/dicomweb',
  headers: {
    'Authorization': 'Bearer IMAGE_TOKEN'
  }
});

// Client for annotations with different headers
const annotationClient = new DICOMwebClient.api.DICOMwebClient({
  url: 'http://annotations.example.com/dicomweb',
  headers: {
    'Authorization': 'Bearer ANNOTATION_TOKEN'
  }
});

// Create viewer with client mapping
const viewer = new DICOMMicroscopyViewer.viewer.VolumeImageViewer({
  metadata: volumeImages,
  clientMapping: {
    'default': imageClient,
    '1.2.840.10008.5.1.4.1.1.91.1': annotationClient,  // Microscopy Bulk Simple Annotations
    '1.2.840.10008.5.1.4.1.1.88.11': annotationClient  // Basic Text SR
  }
});

viewer.render({ container: 'viewport' });
```

## Common Use Cases

### Authentication

Add authentication headers for secure DICOMweb servers:

```javascript
const client = new DICOMwebClient.api.DICOMwebClient({
  url: 'https://secure-dicomweb.example.com',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
});
```

### Custom CORS Headers

Configure custom headers for cross-origin requests:

```javascript
const client = new DICOMwebClient.api.DICOMwebClient({
  url: 'https://dicomweb.example.com',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Custom-CORS-Header': 'value'
  }
});
```

### API Keys

Add API keys for services that require them:

```javascript
const client = new DICOMwebClient.api.DICOMwebClient({
  url: 'https://api.dicom-service.com/dicomweb',
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
});
```

## How Headers are Used Internally

Once you pass the configured client to the viewer, it's used internally by:

1. **VolumeImageViewer** (src/viewer.js) - Uses the client for retrieving image frames
2. **Pyramid Loader** (src/pyramid.js) - Uses `client.retrieveInstanceFrames()` to fetch image tiles
3. **Annotation Loader** (src/annotation.js) - Uses the client to fetch bulk annotation data
4. **Utility Functions** (src/utils.js) - Uses `_fetchBulkdata()` which calls the client

The headers are automatically included in all HTTP requests made by the dicomweb-client to the DICOMweb server.

## Important Notes

- **Headers are configured per client instance**: Each `DICOMwebClient` instance maintains its own set of headers
- **Headers are immutable after instantiation**: To change headers, you need to create a new client instance
- **All requests use the same headers**: All DICOMweb requests made by that client instance will include the configured headers
- **Security**: Never commit authentication tokens or API keys to source control. Use environment variables or secure configuration management

## Reference

- [DICOMweb Client Documentation](https://github.com/dcmjs-org/dicomweb-client)
- [DICOMweb Standard (DICOM Part 18)](http://dicom.nema.org/medical/dicom/current/output/chtml/part18/PS3.18.html)
- [DICOM Microscopy Viewer API Documentation](https://imagingdatacommons.github.io/dicom-microscopy-viewer/)
