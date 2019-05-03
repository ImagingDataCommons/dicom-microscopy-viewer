/**
 *  Enumerates the events for dicom microscopy viewer. Events are captured,
 *  normalized, and re-triggered with a `dicom-microscopy-viewer` prefix. This allows
 *  us to handle events consistently across different browsers.
 *
 *  @enum {String}
 *  @memberof dicom-microscopy-viewer
 *  @readonly
 */
const PROJECT_NAME = 'dicommicroscopyviewer';

const EVENTS = {
    ROI_ADDED: `${PROJECT_NAME}_roi_added`,
    ROI_REMOVED: `${PROJECT_NAME}_roi_removed`,
    ROI_DRAWN: `${PROJECT_NAME}_roi_drawn`,
    ROI_SELECTED: `${PROJECT_NAME}_roi_selected`,
    ROI_MODIFIED: `${PROJECT_NAME}_roi_modified`,
    MOVE_STARTED: `${PROJECT_NAME}_move_started`,
    MOVE_ENDED: `${PROJECT_NAME}_move_ended`,
  };

export default EVENTS;
