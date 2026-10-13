# Segmentations

A host app retrieves DICOM Segmentation instances that share the slide's frame of reference and container, then passes them to `addSegments`. Each segment becomes a toggleable overlay. `showSegment` fetches and renders the segment's frames over the slide, and `hideSegment` removes them again.

## Sub-features

- `seg-add` registers every segment of the SEG instances (`getAllSegments`), hidden by default.
- `seg-show` fetches segment frames and renders the overlay (`isSegmentVisible` true).
- `seg-hide` removes the overlay and restores the slide rendering.
- `seg-binary` handles BINARY SEG (default series: "Stony Brook CNN-generated TIL Map", 2 segments, "TILs Absent" and "TILs Present").
- `seg-fractional` (no journey yet; pass `--seg 1.2.826.0.1.3680043.10.511.3.98120484475702625579693832103359876`) handles a FRACTIONAL TIL map.
- `seg-style` (no journey yet) covers `setSegmentStyle`, `zoomToSegment`, and the in-viewport legend (`SEGMENT_VISIBILITY_CHANGED`).

## How to get to it (user POV)

- In a host app, open the slide and toggle a segment in the segmentation panel. The harness equivalent is `dmvHarness.loadSegmentations([...])` followed by `viewer.showSegment(uid)`.
- Choose a different SEG series in the same study: `--seg <uid>[,<uid>]`, or `--seg auto` for all of them.

## Driving it with drive.mjs

Preconditions:

- The baseline preconditions in `README.md` hold.
- The SEG series has instances whose `FrameOfReferenceUID` and `ContainerIdentifier` match the slide. All 4 SEG series in the default study do.

- **Add segments.** Run `node .cursor/skills/verify-dmv/scripts/drive.mjs --journey segmentation`. Check `addSegments accepted SEG metadata` reports `segments: 2`, and `segments are hidden until shown` lists both with `visible: false`.
- **Show.** It calls `showSegment` for each uid. Check `segment frames loaded without errors` shows `frames.started` growing with `failed: 0`. `02-segments-shown.png` shows a solid overlay covering both tissue sections, and `changedFraction` is about 0.5.
- **Hide.** It calls `hideSegment` for each uid. `03-segments-hidden.png` matches `01-slide-loaded.png`: check `hideSegment restored the original rendering` reports `changedFraction` of about 0.
- **Proof.** Cite the three screenshots and the `segments` field in `result.json`.

## Gotchas

- Without a host-app style, every segment renders in the viewer's `primaryColor` (yellow) at full opacity. "TILs Absent" and "TILs Present" together cover all tissue, so the overlay looks like one solid mask. Slim applies distinct palettes itself.
- `--seg auto` includes `1.2.826.0.1.3680043.10.511.3.43610981438263040730765672953796841`, a 5-instance pyramid with about 155k frames. It is slow to show; avoid it unless you are testing that case.
- `addSegments` throws if given an empty list. The harness reports `no matching SEG instances` when the frame-of-reference or container filter drops everything.
