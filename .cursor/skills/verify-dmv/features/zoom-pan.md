# Zoom and pan

The end user zooms with the mouse wheel, anchored at the cursor, and pans by dragging. The viewer switches to higher-resolution pyramid levels, fetches only the tiles now in view, and publishes `MOVE_STARTED`/`MOVE_ENDED` so the host app can react.

## Sub-features

- `zoom-wheel` zooms in around the cursor position.
- `zoom-refetch` requests higher-resolution frames after zooming, without errors.
- `pan-drag` moves the view center by the dragged distance (in image units, about pixels × resolution).
- `pan-events` publishes `dicommicroscopyviewer_move_ended` after a pan.
- `zoom-buttons` (no journey yet) uses the +/- buttons and the zoom slider.
- `zoom-navigate` (no journey yet) uses the host-app `viewer.navigate({ level, position })`.

## How to get to it (user POV)

- Scroll the mouse wheel over the slide.
- Press and drag on the slide.
- Click the `+` / `–` controls at the top-left, or drag the zoom slider.

## Driving it with drive.mjs

Preconditions:

- The baseline preconditions in `README.md` hold.

- **Pick a tissue point.** Run `node .cursor/skills/verify-dmv/scripts/drive.mjs --journey zoom-pan`. After `01-slide-loaded.png` it picks the darkest 64px block as the zoom anchor (`anchor` in the first zoom check).
- **Wheel zoom.** It sends three `mouseWheel` events (deltaY −400) at the anchor. Check `mouse wheel zoomed in` shows the resolution dropping (about 91 to 3.3 on the default slide), and `zoom fetched higher-resolution tiles` shows `frames.started` growing (about 2 to 236) with `failed: 0`. `02-zoomed-in.png` shows cell-level detail.
- **Drag pan.** It drags 300px left and 200px up from the viewport center. Check `mouse drag panned the view` shows the center moving, and `MOVE_ENDED event published for the pan` shows the count growing by 1. `03-panned.png` shows a shifted field.
- **Proof.** Cite `02-zoomed-in.png`, `03-panned.png`, and the `view` fields in `result.json`.

## Gotchas

- The default slide's center is blank glass between two sections. Zooming there produces near-identical screenshots, and the pixel-diff checks fail even though the zoom worked. Keep the tissue-anchor step if you change slides or zoom depth.
- OpenLayers wheel zoom is animated. Always wait for tiles to settle before reading `view.resolution` or taking a screenshot.
- `MOVE_ENDED` also fires for each wheel-zoom animation. Compare counts before and after the drag, not absolute values.
