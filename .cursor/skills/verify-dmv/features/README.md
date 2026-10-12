# dicom-microscopy-viewer verification map

This directory is the maintained source for verifying what a host application and its end users get from `VolumeImageViewer`. Read this index before driving, then use the matching feature file as the recipe. The harness and scripts are described in `../SKILL.md`.

## Baseline preconditions

- `pnpm run build` has run since the last `src/` change. Doctor warns if `dist/` is stale.
- The harness server is started by this run: `node .cursor/skills/verify-dmv/scripts/server.mjs start`.
- `node .cursor/skills/verify-dmv/scripts/doctor.mjs` prints no FAIL.
- Network access to the IDC public DICOMweb proxy (default data source).
- Default slide: `TCGA-50-6590-01Z-00-DX1`, series `1.3.6.1.4.1.5962.99.1.1044659851.1751703833.1637427232395.2.0`, in study `2.25.6648858190181184824224753085742628317`. The same study carries 4 SEG series and 1 ANN series on that slide's frame of reference.
- Never drive a server this run did not start. Doctor tells you whose server holds the port.

## Driving conventions

- Every journey starts from a fresh Chrome profile and a fresh page load of the harness.
- End-user actions (zoom, pan, draw) are real mouse events on `#viewport`. Host-app actions (add or show overlays, activate tools) are public `VolumeImageViewer` methods on `window.dmvHarness.viewer`.
- Wait on state, not sleeps: `dmvHarness.state`, `dmvHarness.pendingFrames()`, `dmvHarness.idleForMs()`, and event counts in `dmvHarness.counts`.
- Assert on `dmvHarness.snapshot()` and `dmvHarness.events`. Never assert on private symbols.

## Proof and skip reporting

- Each journey writes `.cursor/skills/verify-dmv/.evidence/<timestamp>-<journey>/` with screenshots, `result.json`, `events.json`, and `console.log`.
- Proof is a before/after screenshot pair, a pixel-diff check, the changed snapshot fields, and the published events.
- A check that fails because of the data source (proxy down, series missing) is reported as an environment failure, with the doctor output attached.
- An entry point listed in a feature file that has no journey yet is reported as unverified. Do not count it as covered by a neighboring journey.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then has exactly four H2 sections, in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with drive.mjs`, and `Gotchas`.

## Features

- [Slide rendering](./slide-rendering.md): metadata to tiled pyramid to visible slide, for both dist builds. Journey `render`.
- [Zoom and pan](./zoom-pan.md): mouse wheel zoom and drag pan, with tile refetch and move events. Journey `zoom-pan`.
- [Segmentations](./segmentations.md): add, show, and hide DICOM SEG segments over the slide. Journey `segmentation`.
- [Bulk annotations](./bulk-annotations.md): add and show Microscopy Bulk Simple Annotation groups (clustered at low zoom). Journey `annotations`.
- [ROI drawing](./roi-drawing.md): draw a polygon ROI with the mouse and receive it in slide coordinates. Journey `draw-roi`.

Not yet mapped, so any claim about them is unverified: optical path / multiplexed channel blending, parametric maps, ICC profile toggling, Comprehensive 3D SR, `OverviewImageViewer` / `LabelImageViewer`, and the select/modify/translate/snap interactions.
