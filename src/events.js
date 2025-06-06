const PROJECT_NAME = 'dicommicroscopyviewer'

/**
 *  Enumerates custom events for dicom-microscopy-viewer. Events are captured,
 *  normalized, and re-triggered with a `dicommicroscopyviewer` prefix.
 *  This allows handling of events consistently across different browsers.
 *
 *  @enum {string}
 *  @memberof events
 *  @readonly
 */
const EVENTS = {
  /** Triggered when a ROI was added. */
  ROI_ADDED: `${PROJECT_NAME}_roi_added`,
  /** Triggered when a ROI was removed. */
  ROI_REMOVED: `${PROJECT_NAME}_roi_removed`,
  /** Triggered when a ROI was drawn. */
  ROI_DRAWN: `${PROJECT_NAME}_roi_drawn`,
  /** Triggered when a ROI was selected. */
  ROI_SELECTED: `${PROJECT_NAME}_roi_selected`,
  /** Triggered when the map is clicked. */
  VIEWPORT_CLICKED: `${PROJECT_NAME}_viewport_clicked`,
  /** Triggered when a ROI was double clicked. */
  ROI_DOUBLE_CLICKED: `${PROJECT_NAME}_roi_double_clicked`,
  /** Triggered when mouse moves. */
  POINTER_MOVE: `${PROJECT_NAME}_pointer_move`,
  /** Triggered when a ROI was modified. */
  ROI_MODIFIED: `${PROJECT_NAME}_roi_modified`,
  /** Triggered when a viewport move has started. */
  MOVE_STARTED: `${PROJECT_NAME}_move_started`,
  /** Triggered when a viewport move has ended. */
  MOVE_ENDED: `${PROJECT_NAME}_move_ended`,
  /** Triggered when a loading of data has started. */
  LOADING_STARTED: `${PROJECT_NAME}_loading_started`,
  /** Triggered when a loading of data has ended. */
  LOADING_ENDED: `${PROJECT_NAME}_loading_ended`,
  /** Triggered when an error occurs during loading of data. */
  LOADING_ERROR: `${PROJECT_NAME}_loading_error`,
  /* Triggered when the loading of an image tile has started. */
  FRAME_LOADING_STARTED: `${PROJECT_NAME}_frame_loading_started`,
  /* Triggered when the loading of an image tile has ended. */
  FRAME_LOADING_ENDED: `${PROJECT_NAME}_frame_loading_ended`,
  /* Triggered when the error occurs during loading of an image tile. */
  FRAME_LOADING_ERROR: `${PROJECT_NAME}_frame_loading_error`
}

export default EVENTS
