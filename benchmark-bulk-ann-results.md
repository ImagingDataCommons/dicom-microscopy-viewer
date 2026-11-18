# Bulk annotation benchmark

URL (IDC example study / ANN series):
`http://localhost:3000/studies/2.25.68803095896966276583382138924964839274/series/1.3.6.1.4.1.5962.99.1.1139028448.995765201.1637521600992.2.0`

## Automated CDP run

Puppeteer was not installed in the CI/agent environment when this branch was cut.
Script: [`scripts/benchmark-bulk-ann.mjs`](scripts/benchmark-bulk-ann.mjs).

```bash
pnpm add -D puppeteer
# terminal A: REACT_APP_CONFIG=example pnpm start  (slim linked to this dmv build)
node scripts/benchmark-bulk-ann.mjs --url "<url above>"
```

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
