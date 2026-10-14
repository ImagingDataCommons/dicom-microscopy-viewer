/**
 * Minimal host application for dicom-microscopy-viewer, mirroring the README
 * "Basic usage" flow (and Slim's SEG/ANN loading). It drives the library only
 * through its public API and records everything an agent needs to assert on
 * under `window.dmvHarness`.
 *
 * URL params: server, study, series, controls (comma list), preload, debug=1,
 * build=dynamic|bundle
 *
 * build=dynamic (default) is how Slim consumes the library: the
 * dist/dynamic-import folder is served as the app's lib dir and the data
 * loader worker is resolved from window.PUBLIC_URL + window.PUBLIC_LIB_URL.
 * build=bundle loads dist/dicomMicroscopyViewer.bundle.min.js with
 * PUBLIC_LIB_URL=/dist/.
 */
const BUILDS = {
  dynamic: { lib: '/dist/dynamic-import/', script: 'dicomMicroscopyViewer.min.js' },
  bundle: { lib: '/dist/', script: 'dicomMicroscopyViewer.bundle.min.js' },
}
;(() => {
  const build = BUILDS[new URLSearchParams(window.location.search).get('build') || 'dynamic']
  window.PUBLIC_URL = '/'
  window.PUBLIC_LIB_URL = build.lib
  const script = document.createElement('script')
  script.src = build.lib + build.script
  script.onload = () => start()
  script.onerror = () => {
    window.dmvHarness = { state: 'error', error: `failed to load ${script.src}` }
    const el = document.getElementById('status')
    el.dataset.state = 'error'
    el.textContent = `[error] failed to load ${script.src}`
  }
  document.head.appendChild(script)
})()

function start() {
  const DEFAULTS = {
    server:
      'https://proxy.imaging.datacommons.cancer.gov/current/viewer-only-no-downloads-see-tinyurl-dot-com-slash-3j3d9jyp/dicomWeb',
    study: '2.25.6648858190181184824224753085742628317',
    series: '1.3.6.1.4.1.5962.99.1.1044659851.1751703833.1637427232395.2.0',
  }

  const params = new URLSearchParams(window.location.search)
  const config = {
    server: params.get('server') || DEFAULTS.server,
    study: params.get('study') || DEFAULTS.study,
    series: params.get('series') || DEFAULTS.series,
    controls: (params.get('controls') || 'overview,position,zoom')
      .split(',')
      .filter(Boolean),
    preload: Number(params.get('preload') || 0),
    debug: params.get('debug') === '1',
    build: params.get('build') || 'dynamic',
  }

  const dmv = window.dicomMicroscopyViewer
  const statusEl = document.getElementById('status')
  const container = document.getElementById('viewport')

  const harness = {
    config,
    state: 'loading',
    error: null,
    viewer: null,
    client: null,
    slide: null,
    events: [],
    counts: {},
    framesStarted: 0,
    framesEnded: 0,
    framesFailed: 0,
    lastActivityAt: Date.now(),
    pageErrors: [],
  }
  window.dmvHarness = harness

  function setState(state, message) {
    harness.state = state
    statusEl.dataset.state = state
    statusEl.textContent = `[${state}] ${message || ''}`
  }

  function fail(error) {
    harness.error = String(error?.stack || error)
    setState('error', String(error?.message || error))
    console.error('[harness]', error)
  }

  window.addEventListener('error', (e) => {
    harness.pageErrors.push(String(e.error?.stack || e.message))
  })
  window.addEventListener('unhandledrejection', (e) => {
    harness.pageErrors.push(String(e.reason?.stack || e.reason))
  })

  /** Keep payloads small and JSON-safe; frame events carry pixel arrays. */
  function summarize(type, payload) {
    if (payload == null) return null
    if (type.includes('frame_loading')) {
      return { frameNumber: payload.frameNumber, sopInstanceUID: payload.sopInstanceUID }
    }
    if (payload.uid && payload.scoord3d) {
      return {
        uid: payload.uid,
        graphicType: payload.scoord3d.graphicType,
        graphicData: payload.scoord3d.graphicData,
      }
    }
    if (payload instanceof Error || payload.message) {
      return { name: payload.name, type: payload.type, message: payload.message }
    }
    try {
      return JSON.parse(JSON.stringify(payload, (k, v) => (k === 'event' ? undefined : v)))
    } catch {
      return String(payload)
    }
  }

  for (const type of Object.values(dmv.events.EVENTS)) {
    document.addEventListener(type, (event) => {
      harness.lastActivityAt = Date.now()
      harness.counts[type] = (harness.counts[type] || 0) + 1
      if (type === dmv.events.EVENTS.FRAME_LOADING_STARTED) harness.framesStarted++
      if (type === dmv.events.EVENTS.FRAME_LOADING_ENDED) harness.framesEnded++
      if (type === dmv.events.EVENTS.FRAME_LOADING_ERROR) harness.framesFailed++
      if (type.includes('frame_loading') || type.includes('pointer_move')) return
      harness.events.push({
        type,
        at: Date.now(),
        payload: summarize(type, event.detail?.payload),
      })
    })
  }

  harness.pendingFrames = () => harness.framesStarted - harness.framesEnded
  harness.idleForMs = () => Date.now() - harness.lastActivityAt

  /** Serializable state an agent can assert on without touching internals. */
  harness.snapshot = () => {
    const v = harness.viewer
    const view = v?.getMap().getView()
    return {
      state: harness.state,
      error: harness.error,
      config,
      slide: harness.slide,
      frames: {
        started: harness.framesStarted,
        ended: harness.framesEnded,
        failed: harness.framesFailed,
      },
      view: view
        ? { center: view.getCenter(), resolution: view.getResolution(), zoom: view.getZoom() }
        : null,
      opticalPaths: v ? v.getAllOpticalPaths().map((p) => p.identifier) : [],
      rois: v ? v.getAllROIs().map((r) => ({ uid: r.uid, graphicType: r.scoord3d.graphicType })) : [],
      segments: v
        ? v.getAllSegments().map((s) => ({
            uid: s.uid,
            label: s.label,
            visible: v.isSegmentVisible(s.uid),
          }))
        : [],
      annotationGroups: v
        ? v.getAllAnnotationGroups().map((g) => ({
            uid: g.uid,
            label: g.label,
            graphicType: g.graphicType,
            visible: v.isAnnotationGroupVisible(g.uid),
          }))
        : [],
      counts: harness.counts,
      pageErrors: harness.pageErrors,
    }
  }

  async function searchSeries(modality) {
    const matches = await harness.client.searchForSeries({
      studyInstanceUID: config.study,
      queryParams: { Modality: modality },
    })
    return (matches || []).map((s) => dmv.metadata.formatMetadata(s).dataset.SeriesInstanceUID)
  }

  /**
   * Same filtering Slim applies: only SEG instances on this slide's frame of
   * reference and container are added.
   */
  harness.loadSegmentations = async (seriesUIDs) => {
    const uids = seriesUIDs?.length ? seriesUIDs : await searchSeries('SEG')
    const ref = harness.slide.ref
    const segs = []
    for (const seriesInstanceUID of uids) {
      const metadata = await harness.client.retrieveSeriesMetadata({
        studyInstanceUID: config.study,
        seriesInstanceUID,
      })
      for (const m of metadata) {
        const seg = new dmv.metadata.Segmentation({ metadata: m })
        if (
          seg.FrameOfReferenceUID === ref.FrameOfReferenceUID &&
          seg.ContainerIdentifier === ref.ContainerIdentifier
        ) {
          segs.push(seg)
        }
      }
    }
    if (segs.length === 0) throw new Error(`no matching SEG instances in ${uids.join(',')}`)
    harness.viewer.addSegments(segs)
    return harness.viewer.getAllSegments().map((s) => s.uid)
  }

  harness.loadAnnotations = async (seriesUIDs) => {
    const uids = seriesUIDs?.length ? seriesUIDs : await searchSeries('ANN')
    for (const seriesInstanceUID of uids) {
      const metadata = await harness.client.retrieveSeriesMetadata({
        studyInstanceUID: config.study,
        seriesInstanceUID,
      })
      for (const m of metadata) {
        harness.viewer.addAnnotationGroups(
          new dmv.metadata.MicroscopyBulkSimpleAnnotations({ metadata: m }),
        )
      }
    }
    return harness.viewer.getAllAnnotationGroups().map((g) => g.uid)
  }

  async function main() {
    setState('loading', `retrieving metadata for series ${config.series}`)
    harness.client = new window.DICOMwebClient.api.DICOMwebClient({ url: config.server })
    const metadata = await harness.client.retrieveSeriesMetadata({
      studyInstanceUID: config.study,
      seriesInstanceUID: config.series,
    })
    const volumeImages = []
    for (const m of metadata) {
      const image = new dmv.metadata.VLWholeSlideMicroscopyImage({ metadata: m })
      const flavor = image.ImageType[2]
      if (flavor === 'VOLUME' || flavor === 'THUMBNAIL') volumeImages.push(image)
    }
    if (volumeImages.length === 0) throw new Error('series has no VOLUME/THUMBNAIL images')

    const ref = volumeImages[0]
    harness.slide = {
      instances: metadata.length,
      volumeImages: volumeImages.length,
      containerIdentifier: ref.ContainerIdentifier,
      ref: {
        FrameOfReferenceUID: ref.FrameOfReferenceUID,
        ContainerIdentifier: ref.ContainerIdentifier,
      },
    }

    harness.viewer = new dmv.viewer.VolumeImageViewer({
      client: harness.client,
      metadata: volumeImages,
      controls: config.controls,
      preload: config.preload,
      debug: config.debug,
      errorInterceptor: (error) => {
        harness.events.push({ type: 'errorInterceptor', at: Date.now(), payload: summarize('error', error) })
        return error
      },
    })
    harness.viewer.render({ container })
    setState('ready', `${ref.ContainerIdentifier} · ${volumeImages.length} volume images`)
  }

  main().catch(fail)
}
