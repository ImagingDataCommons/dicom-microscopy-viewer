# ROI drawing

A host app activates a drawing tool with `activateDrawInteraction({ geometryType })`. The end user then clicks vertices on the slide. Closing the shape publishes `ROI_DRAWN` with an `ROI` whose `scoord3d` is in slide coordinates (mm), and the ROI shows up in `getAllROIs()` and on the viewport.

## Sub-features

- `roi-polygon` draws a polygon by clicking vertices and closing on the first point.
- `roi-event` publishes `dicommicroscopyviewer_roi_drawn` with graphicType `POLYGON` and a closed ring (first point equals last).
- `roi-list` returns the drawn ROI from `getAllROIs()`.
- `roi-visible` renders the outline on the viewport.
- `roi-other-geometries` (no journey yet) covers `point`, `box`, `circle`, `line`, `freehandpolygon`, and `freehandline`.
- `roi-api` (no journey yet) covers `addROI`, `removeROI`, `setROIStyle`, and `zoomToROI`.

## How to get to it (user POV)

- In a host app, pick a drawing tool (e.g. Polygon), click points on the slide, and click the first point to finish. The harness equivalent is `viewer.activateDrawInteraction({ geometryType: 'polygon' })` plus mouse clicks.

## Driving it with drive.mjs

Preconditions:

- The baseline preconditions in `README.md` hold.
- No ROIs exist. Each journey loads a fresh page.

- **Activate tool.** Run `node .cursor/skills/verify-dmv/scripts/drive.mjs --journey draw-roi`. It calls `activateDrawInteraction({ geometryType: 'polygon' })`.
- **Click vertices.** It clicks four corners of a 300×200px rectangle around the viewport center, then clicks the first corner again. Check `ROI_DRAWN event published after closing the polygon` shows a `2.25.*` uid.
- **Slide coordinates.** Check `drawn ROI is a POLYGON in slide coordinates` reports `points: 5` and a first point in mm, e.g. `[-12.37, -17.55, 0]`.
- **Listed and visible.** Check `getAllROIs returns the drawn ROI` lists exactly one POLYGON. `02-roi-drawn.png` shows the rectangle outline.
- **Proof.** Cite `02-roi-drawn.png` and the `roi_drawn` entry in `events.json`.

## Gotchas

- Clicks less than about 350ms apart can be read as a double click, which OpenLayers maps to zoom. `ctx.click` spaces them out.
- Closing requires clicking within OpenLayers' snap tolerance (a few pixels) of the first vertex. Re-click the exact first-vertex coordinates.
- `deactivateDrawInteraction()` runs after the event, so later mouse input does not start a second ROI.
