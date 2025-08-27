# Segment Styling Example

This document demonstrates how to use the new segment styling functionality in the DICOM Microscopy Viewer.

## Overview

The `VolumeImageViewer` class now supports setting custom colors for segments using the `setSegmentStyle` method. This allows you to:

1. Create custom palette color lookup tables for segments
2. Apply custom colors to individual segments
3. Update segment styles dynamically

## Basic Usage

```javascript
// Assuming you have a volume viewer instance
const volumeViewer = new dmv.viewer.VolumeImageViewer({
  client: yourDicomClient,
  metadata: yourImageMetadata
});

// Add segments to the viewer
volumeViewer.addSegments(segmentationMetadata);

// Get a segment UID (you'll need this from your segmentation data)
const segmentUID = 'your-segment-uid';

// Create a custom color for the segment (RGB values 0-255)
const segmentColor = [255, 0, 0]; // Red color

// Create a palette color lookup table for the segment
const paletteColorLookupTable = volumeViewer.createSegmentPaletteColorLookupTable(
  segmentUID, 
  segmentColor
);

// Apply the color to the segment in the viewer
volumeViewer.setSegmentStyle(segmentUID, {
  opacity: 0.8,
  paletteColorLookupTable: paletteColorLookupTable
});
```

## Supported Palette Formats

The `setSegmentStyle` method supports two different palette formats:

### 1. PaletteColorLookupTable Instances (Recommended)

```javascript
// Using the viewer's built-in method
const paletteColorLookupTable = volumeViewer.createSegmentPaletteColorLookupTable(segmentUID, segmentColor)

volumeViewer.setSegmentStyle(segmentUID, {
  paletteColorLookupTable: paletteColorLookupTable
})
```

### 2. Plain Objects with LUT Data

```javascript
// External function that returns a plain object
const createSegmentPaletteColorLookupTable = (segmentUID, color) => {
  const redData = new Uint16Array([0, color[0]])
  const greenData = new Uint16Array([0, color[1]])
  const blueData = new Uint16Array([0, color[2]])

  return {
    uid: `segment-${segmentUID}-color-lut`,
    redDescriptor: [2, 0, 16, 0],
    greenDescriptor: [2, 0, 16, 0],
    blueDescriptor: [2, 0, 16, 0],
    redData,
    greenData,
    blueData
  }
}

// The viewer automatically converts this to a PaletteColorLookupTable instance
const paletteColorLookupTable = createSegmentPaletteColorLookupTable(segmentUID, segmentColor)

volumeViewer.setSegmentStyle(segmentUID, {
  paletteColorLookupTable: paletteColorLookupTable
})
```

**Note**: When using plain objects, the viewer automatically converts them to proper `PaletteColorLookupTable` instances internally, so you get the same functionality regardless of the format you use.

## Advanced Usage

### Custom Colors

You can create segments with different colors:

```javascript
// Red segment
volumeViewer.setSegmentStyle('segment1', {
  paletteColorLookupTable: volumeViewer.createSegmentPaletteColorLookupTable('segment1', [255, 0, 0])
});

// Green segment
volumeViewer.setSegmentStyle('segment2', {
  paletteColorLookupTable: volumeViewer.createSegmentPaletteColorLookupTable('segment2', [0, 255, 0])
});

// Blue segment
volumeViewer.setSegmentStyle('segment3', {
  paletteColorLookupTable: volumeViewer.createSegmentPaletteColorLookupTable('segment3', [0, 0, 255])
});
```

### Combining Opacity and Color

You can set both opacity and color at the same time:

```javascript
volumeViewer.setSegmentStyle(segmentUID, {
  opacity: 0.6,
  paletteColorLookupTable: volumeViewer.createSegmentPaletteColorLookupTable(segmentUID, [255, 165, 0]) // Orange
});
```

### Updating Existing Segments

You can update the style of existing segments:

```javascript
// First, show the segment if it's not visible
volumeViewer.showSegment(segmentUID);

// Then update its style
volumeViewer.setSegmentStyle(segmentUID, {
  opacity: 0.9,
  paletteColorLookupTable: volumeViewer.createSegmentPaletteColorLookupTable(segmentUID, [128, 0, 128]) // Purple
});
```

## How It Works

1. **Palette Creation**: The `createSegmentPaletteColorLookupTable` method creates a binary palette with two colors:
   - Index 0: Background (transparent/black)
   - Index 1: Your specified segment color
   
   This uses the `buildPaletteColorLookupTable` utility function which properly handles the palette creation and ensures the `data` property is correctly initialized.

2. **Style Application**: The `setSegmentStyle` method:
   - Automatically detects if the palette is a plain object or a `PaletteColorLookupTable` instance
   - Converts plain objects to proper `PaletteColorLookupTable` instances when needed
   - Updates the segment's internal style object
   - Regenerates the OpenLayers tile layer style
   - Applies the new color palette to the segment rendering

3. **Real-time Updates**: Changes are applied immediately to the visible segments

## Technical Details

- **Binary Segments**: The current implementation is optimized for binary segmentation masks
- **Color Format**: Colors are specified as RGB triplets with values 0-255
- **Performance**: Style updates are efficient and don't require reloading the segment data
- **Compatibility**: Works with existing segment functionality and doesn't break existing code
- **Bug Fixes**: Fixed an underlying bug in the `PaletteColorLookupTable` class where the `_expandSegmentedLUTData` method was being called with incorrect parameters

## Error Handling

The method includes proper error handling:

```javascript
try {
  volumeViewer.setSegmentStyle('invalid-uid', {
    paletteColorLookupTable: volumeViewer.createSegmentPaletteColorLookupTable('invalid-uid', [255, 0, 0])
  });
} catch (error) {
  console.error('Failed to set segment style:', error.message);
}
```

## Limitations

- Currently optimized for binary segmentation masks
- Color changes only affect the visual representation, not the underlying data
- Requires the segment to be added to the viewer before styling can be applied

## Troubleshooting

### Common Issues

**Issue**: `paletteColorLookupTable.data is undefined`

**Cause**: This typically happens when:
1. Trying to create a `PaletteColorLookupTable` directly instead of using the `buildPaletteColorLookupTable` utility function
2. Using a plain object with LUT data that doesn't have the `data` getter property
3. There was also a bug in the original `PaletteColorLookupTable` class where the `_expandSegmentedLUTData` method was being called with incorrect parameters

**Solution**: The viewer now automatically handles both cases:

```javascript
// ✅ Option 1: Use the viewer's method (recommended)
const paletteColorLookupTable = volumeViewer.createSegmentPaletteColorLookupTable(segmentUID, segmentColor)

// ✅ Option 2: Use a plain object with LUT data (automatically converted)
const paletteColorLookupTable = createSegmentPaletteColorLookupTable(segmentUID, segmentColor)

// ❌ Incorrect - Don't create PaletteColorLookupTable directly
const paletteColorLookupTable = new PaletteColorLookupTable({...})
```

**Note**: The underlying bug in the `PaletteColorLookupTable` class has been fixed, and the viewer now automatically converts plain objects to proper instances when needed.

**Issue**: Colors not updating in the viewer

**Cause**: The segment might not be visible or the style update might not have been applied correctly.

**Solution**: Ensure the segment is visible and the style is applied:

```javascript
// Make sure the segment is visible first
volumeViewer.showSegment(segmentUID)

// Then apply the style
volumeViewer.setSegmentStyle(segmentUID, {
  paletteColorLookupTable: volumeViewer.createSegmentPaletteColorLookupTable(segmentUID, segmentColor)
})
```
