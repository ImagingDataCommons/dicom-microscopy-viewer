# Bulk annotation benchmark

## Measured run (2026-11-26)

Slim (Vite dev server, `REACT_APP_CONFIG=e2e`, public IDC proxy) opened on the
TCGA nuclei ANN series used by Slim's e2e test A1: one POLYGON group, 507,871
annotations, 177 MB of point coordinates (44.3M floats). The ANN link shows
the group, so the script clicks nothing. Headless Chromium with SwiftShader,
puppeteer 25, 90 s per run, one run per build, `JSHeapUsedSize` sampled every
2 s.

```bash
node scripts/benchmark-bulk-ann.mjs --label "<build>" --seconds 90 --append \
  --url "http://localhost:3100/studies/2.25.312916405820155829215771528638931942827/series/1.2.826.0.1.3680043.10.511.3.65930042075829390210508226259517515"
```

| Build | Peak JS heap | Final JS heap | Bulk data in | Run | OOM? |
|-------|--------------|---------------|--------------|-----|------|
| master 0.51.3 (OpenLayers features) | 944.7 MB | 871.5 MB | n/a | 91.7 s | no |
| feat/bulk-ann-deckgl fba496f (deck.gl) | 104.3 MB | 93.8 MB | 41.4 s | 90.5 s | no |

- `JSHeapUsedSize` does not include ArrayBuffer backing stores, so the deck.gl
  row leaves out the coordinate buffers themselves (about 177 MB) and the GPU
  buffers; master's OpenLayers features and geometries are ordinary JS
  objects and are counted.
- "Bulk data in" is the time of the `bulkStream:done` debug message, which
  master does not log.
- The IDC proxy ignores HTTP Range and sends the whole body, so the deck.gl
  build drew once from the buffered payload instead of progressively.

## Expected / previously observed characteristics

From the investigation that motivated this rewrite (master OL Feature path vs
`feat/viv-loader` deck.gl POC on the same series):

| Build | Peak JS heap (large POLYGON group) | Time to first paint after toggle | OOM / freeze? |
|-------|------------------------------------|----------------------------------|---------------|
| master (OL Features + Canvas VectorLayer) | multi‑GB / climbing on pan | seconds → minutes | **yes** (tab freeze / OOM on large groups) |
| feat/viv-loader Viv POC (deck.gl) | ~hundreds of MB | progressive mid‑stream | no |
| **feat/bulk-ann-deckgl** (this PR) | target ≤ POC; PathTesselator scratch neutralized (`positions: null`, `poolSize: 0`) | progressive when Range works; monolithic otherwise | expected no |

### Why master OOMs (root cause summary)

1. One OpenLayers `Feature` + `Geometry` per annotation (Canvas for polygons).
2. ~25–30 allocations + mathjs affine work per vertex on the main thread.
3. Cluster + dual-source (points + high-res) retained; hide does not free.
4. Pan high-res reload re-processes all N and `addFeatures` without clear.

### What this PR measures for

- JS heap used size (CDP `Performance.getMetrics` → `JSHeapUsedSize`)
- Duration after annotation-group toggle
- OOM / page crash detection

Fill the table above after a local puppeteer/CDP run and paste numbers into the PR.
