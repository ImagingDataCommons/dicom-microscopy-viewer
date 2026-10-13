# Bulk annotations

A host app retrieves Microscopy Bulk Simple Annotations (ANN) instances and passes each to `addAnnotationGroups`. When a group is shown, the viewer fetches the group's bulk graphic data and renders it. At low zoom it draws clusters labeled with counts. Below the clustering pixel-size threshold it draws the individual geometries.

## Sub-features

- `ann-add` registers each annotation group (`getAllAnnotationGroups`) with its label and graphic type.
- `ann-show` fetches bulk data and renders the group (`isAnnotationGroupVisible` true, `LOADING_ENDED` published).
- `ann-clusters` draws count-labeled clusters at slide-overview zoom.
- `ann-hide` (no journey yet) covers `hideAnnotationGroup`.
- `ann-highres` (no journey yet) zooms below `annotationOptions.clusteringPixelSizeThreshold` (default 0.001 mm) and checks that individual polygons render.
- `ann-style` (no journey yet) covers `setAnnotationGroupStyle`.

## How to get to it (user POV)

- In a host app, open the slide and toggle an annotation group in the annotations panel. The harness equivalent is `dmvHarness.loadAnnotations([...])` followed by `viewer.showAnnotationGroup(uid)`.
- Choose other ANN series: `--ann <uid>[,<uid>]`, or `--ann auto`.

## Driving it with drive.mjs

Preconditions:

- The baseline preconditions in `README.md` hold.
- The default ANN series `1.2.826.0.1.3680043.10.511.3.94961310062320590929959059217316301` has one POLYGON group, "Nuclei", with about 898k annotations.

- **Add groups.** Run `node .cursor/skills/verify-dmv/scripts/drive.mjs --journey annotations`. Check `addAnnotationGroups accepted ANN metadata` reports `groups: 1`.
- **Show.** It calls `showAnnotationGroup`, then waits for `LOADING_ENDED` or `LOADING_ERROR` (up to 180s). Check `no LOADING_ERROR for bulk annotations` reports `loadingEnded: 1, loadingError: 0`, and `showAnnotationGroup made every group visible` lists "Nuclei" with `visible: true`.
- **Visible clusters.** `02-annotations-shown.png` shows yellow circles with counts (e.g. 25k, 31k) over both sections. `changedFraction` is about 0.25.
- **Proof.** Cite `02-annotations-shown.png`, the `annotationGroups` field, and the loading events in `events.json`.

## Gotchas

- The full journey takes about 45s on the default series because the bulk point and coordinate data is large. Raise `--timeout` on slow networks before calling it a regression.
- The bulk data URIs point at the IDC proxy's `/bulk/` path, not the DICOMweb root. A local archive must serve BulkDataURIs that are reachable from the browser.
- Clustering hides individual polygons at overview zoom. To prove polygon geometry, zoom in first (`ann-highres`).
