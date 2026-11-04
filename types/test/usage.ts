/**
 * Compiled with `tsc -p types` to check that the declarations support the
 * documented usage. Not executed.
 */
import * as dmv from 'dicom-microscopy-viewer'

declare const client: dmv.DicomWebClient
declare const signal: AbortSignal

/** Viv, as in the README */
async function useViv(): Promise<void> {
  const { data, metadata, destroy } = await dmv.viv.loadDicomWeb({
    client,
    studyInstanceUID: '1.2.3',
    seriesInstanceUID: '1.2.3.4',
    signal,
    cacheSize: 0,
  })
  const tile: dmv.viv.PixelData = await data[0].getTile({
    x: 0,
    y: 0,
    selection: { c: 0 },
    signal,
  })
  const width: number = tile.width
  const dtype: dmv.viv.Dtype = data[0].dtype
  const lowest = data[data.length - 1]
  if (lowest.getRaster !== undefined) {
    await lowest.getRaster({ selection: { c: 0 } })
  }
  const identifier: string = metadata.opticalPaths[0].identifier
  const reader: dmv.pyramid.VolumeImageReader = metadata.reader
  destroy()
  void [width, dtype, identifier, reader]
}

/** Reader */
async function useReader(): Promise<void> {
  const reader = await dmv.pyramid.VolumeImageReader.fromSeries({
    client,
    studyInstanceUID: '1.2.3',
    seriesInstanceUID: '1.2.3.4',
    skipThumbnails: true,
    signal,
  })
  const [base] = reader.levels
  const info = reader.getPixelInfo(reader.opticalPaths[0].identifier)
  const tile = await reader.getTile({
    opticalPathIdentifier: reader.opticalPaths[0].identifier,
    level: base.index,
    column: 0,
    row: 0,
    crop: true,
    signal,
  })
  const pixels: dmv.PixelArray = tile.pixelArray
  const [x, y] = dmv.utils.applyTransform({
    coordinate: [0, 0],
    affine: reader.affine,
  })
  const arrayType: dmv.pyramid.ArrayType = info.arrayType
  reader.destroy()
  void [pixels, x, y, arrayType]
}

/** Errors */
function handleError(error: unknown): string | undefined {
  if (error instanceof dmv.errors.CustomError) {
    if (error.code === dmv.errors.errorCodes.UNSUPPORTED_PIXEL_DATA) {
      return error.type
    }
    return error.code
  }
  return undefined
}

/** View API and events */
function useViewer(container: HTMLElement): void {
  const viewer = new dmv.viewer.VolumeImageViewer({ client, metadata: [] })
  viewer.render({ container })
  const state: dmv.viewer.ViewState = viewer.getViewState()
  viewer.setViewState({ center: state.center, resolution: 0.001, rotation: 0 })
  viewer.fitBounds([
    [10, 20],
    [12, 21],
  ])
  viewer.setImageColorMatrix(
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
    { colorSpace: 'linear-srgb' },
  )
  viewer.setImageColorMatrix(null)
  /** Methods without exact types stay usable */
  viewer.activateOpticalPath('1')
  container.addEventListener(dmv.events.EVENTS.VIEW_CHANGED, (event) => {
    const detail = (event as CustomEvent<
      dmv.events.EventDetail<dmv.events.ViewChangedPayload>
    >).detail
    const resolution: number | undefined = detail.payload.viewState.resolution
    void resolution
  })
}

void [useViv, useReader, handleError, useViewer]

/** Mistakes the declarations must reject */
async function misuse(reader: dmv.pyramid.VolumeImageReader): Promise<void> {
  /** @ts-expect-error The view state has no zoom */
  dmv.viewer.VolumeImageViewer.prototype.setViewState({ zoom: 2 })
  /** @ts-expect-error The level is a number */
  await reader.getTile({ opticalPathIdentifier: '1', level: '0', column: 0, row: 0 })
  /** @ts-expect-error Unknown color space */
  dmv.viewer.VolumeImageViewer.prototype.setImageColorMatrix([], { colorSpace: 'p3' })
}
void misuse
