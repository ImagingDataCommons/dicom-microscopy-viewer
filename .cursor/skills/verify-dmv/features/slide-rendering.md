# Slide rendering

A host app retrieves a slide series' metadata over DICOMweb, wraps each instance in `VLWholeSlideMicroscopyImage`, constructs `VolumeImageViewer`, and calls `render({ container })`. The user then sees the whole slide fitted to the viewport, with tiles fetched as frames, decoded in a web worker, and drawn by OpenLayers. Scale-line, zoom, overview, and mouse-position controls are also shown.

## Sub-features

- `render-metadata` builds the pyramid from VOLUME/THUMBNAIL instances of the series.
- `render-tiles` fetches frames via `retrieveInstanceFrames` and decodes them (this slide is JPEG baseline, transfer syntax `1.2.840.10008.1.2.4.50`).
- `render-visible` shows tissue in the viewport, not a blank canvas.
- `render-controls` shows the scale line, zoom +/- and slider, overview map (top-left), and mouse position.
- `render-build-dynamic` works when loaded from `dist/dynamic-import/` (Slim's path).
- `render-build-bundle` works when loaded from `dist/dicomMicroscopyViewer.bundle.min.js`.

## How to get to it (user POV)

- Open a host page that embeds the viewer with a slide series (the harness: `http://127.0.0.1:<port>/harness`).
- Point the same page at another slide: `?server=<dicomweb>&study=<uid>&series=<uid>`.
- Load the library from the other build: `?build=bundle`.

## Driving it with drive.mjs

Preconditions:

- The baseline preconditions in `README.md` hold.

- **Load the slide.** Run `node .cursor/skills/verify-dmv/scripts/drive.mjs --journey render`. The status bar turns green with `[ready] TCGA-50-6590-01Z-00-DX1 · 5 volume images`.
- **Tiles settle.** The same run waits for `frames.ended === frames.started` with no events for 2s. Check `tiles retrieved and decoded without errors` passes, with `failed: 0`.
- **Visible tissue.** `01-slide-loaded.png` shows two tissue sections side by side, and check `viewport shows image content` reports `stddev > 8` and `contentFraction > 0.05` (a healthy run is about 74 and 0.95).
- **Bundle build.** Run `node .cursor/skills/verify-dmv/scripts/drive.mjs --journey render --build bundle`. Today this fails, see Gotchas. The evidence shows a blank viewport, `frames.ended: 0`, and a `404 /dist/dataLoader.worker.min.js` in the `no 404s` check.
- **Another slide.** Add `--server <url> --study <uid> --series <uid>`. Run doctor with the same flags first.
- **Proof.** Cite `01-slide-loaded.png` and `result.json` from the evidence directory.

## Gotchas

- `--build bundle` hangs silently. The bundle asks for `dataLoader.worker.min.js` under `PUBLIC_URL + PUBLIC_LIB_URL`, but the bundle build only emits `dataLoader.worker.bundle.min.js`. Module-worker load failures produce no console error and no `FRAME_LOADING_ERROR`, so frames just never end. Do not weaken the check to make this pass.
- A stale `dist/` renders old code with no visible sign. Trust doctor's freshness line, not the screenshot.
- The "No map visible because the map container's width or height are 0" warnings in `console.log` come from the overview map before layout. They are harmless.
