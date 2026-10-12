---
name: verify-dmv
description: Prove dicom-microscopy-viewer behavior in a real browser. Serves a minimal host-app harness that loads the built library from dist/, renders a public IDC whole-slide image over DICOMweb, and drives it in an isolated headless Chrome (mouse wheel/drag/clicks + public API), capturing screenshots, viewer events, and pass/fail checks. Use after changing src/ (rendering, tiles, workers, segmentations, bulk annotations, ROI drawing, interactions) or before claiming a viewer fix works.
---

# Verify dicom-microscopy-viewer

This repo is a **library**, not an app. The user-facing surface is what a host app (e.g. Slim) gets when it embeds `VolumeImageViewer`: an OpenLayers viewport that renders tiles, overlays and ROIs, reacts to mouse input, and publishes `dicommicroscopyviewer_*` DOM events. The harness at `harness/` is that host app, written like the README "Basic usage" plus Slim's SEG/ANN loading. It only calls public API.

All commands run from the repo root. Paths below are relative to it.

```
S=.cursor/skills/verify-dmv/scripts
```

## Launch

1. Build the code under test. The harness loads `dist/`, not `src/`, so a stale build silently tests old code.
   ```
   pnpm install          # only if node_modules is missing
   pnpm run build        # ~12s, writes dist/ and dist/dynamic-import/
   ```
2. Start the harness server (static, repo root, `127.0.0.1:8765` by default):
   ```
   node $S/server.mjs start [--port 8766]
   ```
   Ready when it prints `ready: pid <n>, http://127.0.0.1:<port>/harness`. It records its PID and port in `.cursor/skills/verify-dmv/.run/server.json`.
3. Data: the harness defaults to the **public IDC DICOMweb proxy**: no auth, CORS open to localhost, read-only. It uses slide `TCGA-50-6590-01Z-00-DX1` (study `2.25.6648858190181184824224753085742628317`), which has matching SEG and ANN series. You need network access. There is nothing to seed or migrate.

Teardown is in [Cleanup](#cleanup).

Isolation: each `drive.mjs` run launches its own Chrome with a throwaway profile, so runs never share browser state. Several checkouts or agents can each run their own server by passing different `--port` values. `start` refuses a port already held by another verify-dmv instance.

## Doctor

Read-only. Run it first, and again whenever something looks off:

```
node $S/doctor.mjs [--server <url> --study <uid> --series <uid>]
```

It checks:
- Both dist builds exist and are newer than `src/`. If it prints WARN, run `pnpm run build`.
- The dicomweb-client UMD file is present.
- A Chrome binary is found. Set `CHROME_PATH` to override.
- The recorded server PID is alive and its port is serving *this* checkout.
- No Chrome left behind by an earlier drive is still running.
- The DICOMweb study is reachable and contains the slide series.

It exits 1 on any FAIL.

## Drive

```
node $S/drive.mjs --list
node $S/drive.mjs --journey <render|zoom-pan|segmentation|annotations|draw-roi> [options]
```

| option | meaning |
| --- | --- |
| `--build dynamic\|bundle` | which dist build the harness loads. Default `dynamic` is how Slim consumes the library |
| `--server --study --series` | another DICOMweb source/slide (forwarded to the harness as URL params) |
| `--seg <uids>\|auto` / `--ann <uids>\|auto` | SEG/ANN series for those journeys; `auto` = every SEG/ANN in the study |
| `--headed` | watch the browser |
| `--timeout <ms>` | per-wait timeout (default 90000) |
| `--port <n>` | server port if not the recorded one |

Every journey loads the slide first, waits for tiles to settle, and screenshots that state. It then performs its user actions and asserts on what happened. The exit code is 0 only if every check passed. The feature map in `features/` says what each journey proves.

How it drives:
- **User input** goes through CDP `Input.dispatchMouseEvent` (wheel, drag, clicks) on the real viewport. The viewport is `#viewport` (`data-testid="viewport"`), 1280×872 below a 28px status bar.
- **Host-app calls** (`addSegments`, `showSegment`, `addAnnotationGroups`, `showAnnotationGroup`, `activateDrawInteraction`) go through `window.dmvHarness.viewer`, the same public API a host app uses. Do not reach into private symbols.
- **Readiness**: `window.dmvHarness.state` is `ready` or `error`, mirrored in `#status[data-state]`. "Tiles settled" means `dmvHarness.pendingFrames() <= 0 && dmvHarness.idleForMs() > 2000`.
- **State to assert on**: `dmvHarness.snapshot()` returns view center/resolution, frame counters, ROIs, segments, annotation groups with visibility, per-event counts, and page errors. `dmvHarness.events` holds every viewer event except frame and pointer-move events.

To add a journey, add a function to `JOURNEYS` in `scripts/drive.mjs` and a feature file in `features/`. To poke around interactively, run `node $S/server.mjs start` and open `http://127.0.0.1:8765/harness` in any browser (append `?build=bundle`, `&series=...`, etc.).

## Evidence

Each run writes `.cursor/skills/verify-dmv/.evidence/<UTC timestamp>-<journey>/`:
- `NN-<step>.png`: the screenshot after each step. Start with `01-slide-loaded.png`.
- `result.json`: `passed`, every check with its details, screenshot stats (luminance stddev and share of non-background pixels), the final `snapshot`, `serverMisses` (404s seen by the harness server), and `fatal`.
- `events.json`: viewer events in order, with summarized payloads (e.g. ROI uid/graphicType/graphicData).
- `console.log`: page console output, exceptions, and Chrome log entries.

This directory is gitignored and survives cleanup.

Proof standards:
- Use the real path: mouse input for interactions, and public API for what a host app would call. A check like "the API returned true" is not proof unless it comes with a visible or evented effect.
- Capture the action *and* the resulting state: a before/after screenshot pair plus a pixel-diff check, and the snapshot fields that changed.
- Verify side effects: tile requests started and ended (`frames`), events published (`ROI_DRAWN`, `MOVE_ENDED`, `LOADING_ENDED`), and no 404s for library assets.
- A blank viewport is a failure even if every API call succeeded. The `viewport shows image content` check exists to catch that.
- No mocks. The DICOMweb server is real. If you swap in a local archive, say so in the report.
- When reporting, cite the evidence directory and embed the key screenshots.

## Cleanup

```
node $S/cleanup.mjs
```

This stops the recorded server PID, kills any Chrome process group left by a crashed drive (as recorded in `.run/chrome-*.json`), deletes their temp profiles, and removes `.run/`. It never kills by process name and never touches `.evidence/`. A normal drive already kills its own Chrome on exit. To stop only the server, run `node $S/server.mjs stop`.

## Helpers

| script | invocation |
| --- | --- |
| `scripts/server.mjs` | `node $S/server.mjs start\|status\|stop [--port N]` |
| `scripts/doctor.mjs` | `node $S/doctor.mjs` |
| `scripts/drive.mjs` | `node $S/drive.mjs --journey <name> [...]` |
| `scripts/cleanup.mjs` | `node $S/cleanup.mjs` |
| `scripts/lib.mjs` | shared: paths, default data UIDs, Chrome discovery, PNG decode/diff |
| `harness/index.html`, `harness/harness.js` | the host app; open `http://127.0.0.1:<port>/harness` |

Requirements: Node ≥ 22 (it uses the global `WebSocket`) and Chrome or Chromium. There are no npm dependencies beyond the repo's own.

## Gotchas

- **The `bundle` build does not decode tiles in a plain host page.** It resolves its worker as `window.PUBLIC_URL + window.PUBLIC_LIB_URL + "dataLoader.worker.min.js"`, but the bundle build emits only `dist/dataLoader.worker.bundle.min.js`. Frames start and never end (`frames.ended` stays 0), the viewport stays blank, and the console shows nothing. With `--build bundle` the `no 404s` check names the missing file. `dynamic`, Slim's path, works.
- If you see a blank viewport or tiles that never finish under `dynamic`, run doctor first (stale or missing `dist/dynamic-import`), then check `serverMisses` in `result.json`.
- The slide center is blank glass between two tissue sections. `zoom-pan` therefore zooms at the darkest 64px block of the first screenshot, not the center. Keep that approach if you change slides.
- The IDC proxy is a shared public service. Occasional slow tiles are normal, so raise `--timeout` before suspecting the library. If the proxy is down, doctor's DICOMweb line fails. Report that as an environment failure, not a library regression.
