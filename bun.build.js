await Bun.build({
  entrypoints: ["./src/dicom-microscopy-viewer.js"],
  outdir: "./dist/esm",
  splitting: true,
  sourcemap: "none",
  format: "esm",
  target: "browser",
  minify: true,
})
