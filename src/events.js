/**
 *  Enumerates the events for dicom microscopy viewer. Native events are captured,
 *  normalized, and re-triggered with a `dicom-microscopy-viewer` prefix. This allows
 *  us to handle events consistently across different browsers.
 *
 *  @enum {String}
 *  @memberof dicom-microscopy-viewer
 *  @readonly
 */
const PROJECT_NAME = 'dicommicroscopyviewer';

const EVENTS = {
    //
    // MOUSE
    //
  
    /**
     * https://developer.mozilla.org/en-US/docs/Web/Events/mousedown
     *  @type {String}
     */
    MOUSE_DOWN: `${PROJECT_NAME}mousedown`,
  
    /**
     * https://developer.mozilla.org/en-US/docs/Web/Events/mouseup
     *  @type {String}
     */
    MOUSE_UP: `${PROJECT_NAME}mouseup`,
  
    /**
     * Is fired if a handled `MOUSE_DOWN` event does not `stopPropagation`. The hook
     * we use to create new measurement data for mouse events.
     *  @type {String}
     */
    MOUSE_DOWN_ACTIVATE: `${PROJECT_NAME}mousedownactivate`,
  
    /**
     * https://developer.mozilla.org/en-US/docs/Web/Events/drag
     *  @type {String}
     */
    MOUSE_DRAG: `${PROJECT_NAME}mousedrag`,
  
    /**
     * https://developer.mozilla.org/en-US/docs/Web/Events/mousemove
     *  @type {String}
     */
    MOUSE_MOVE: `${PROJECT_NAME}mousemove`,
  
    /**
     * https://developer.mozilla.org/en-US/docs/Web/Events/click
     *  @type {String}
     */
    MOUSE_CLICK: `${PROJECT_NAME}mouseclick`,
  
    /**
     * https://developer.mozilla.org/en-US/docs/Web/Events/dblclick
     *  @type {String}
     */
    MOUSE_DOUBLE_CLICK: `${PROJECT_NAME}mousedoubleclick`,
  
    /**
     * https://developer.mozilla.org/en-US/docs/Web/Events/wheel
     *  @type {String}
     */
    MOUSE_WHEEL: `${PROJECT_NAME}mousewheel`,
  
    //
    // TOUCH
    //
  
    /**
     * https://developer.mozilla.org/en-US/docs/Web/Events/touchstart
     *  @type {String}
     */
    TOUCH_START: `${PROJECT_NAME}touchstart`,
  
    /**
     * Is fired if a handled `TOUCH_START` event does not `stopPropagation`. The hook
     * we use to create new measurement data for touch events.
     *  @type {String}
     */
    TOUCH_START_ACTIVE: `${PROJECT_NAME}touchstartactive`,
  
    /**
     *  @type {String}
     */
    TOUCH_END: `${PROJECT_NAME}touchend`,
  
    /**
     *  @type {String}
     */
    TOUCH_DRAG: `${PROJECT_NAME}touchdrag`,
  
    /**
     *  @type {String}
     */
    TOUCH_DRAG_END: `${PROJECT_NAME}touchdragend`,
  
    /**
     * http://hammerjs.github.io/recognizer-pinch/
     *  @type {String}
     */
    TOUCH_PINCH: `${PROJECT_NAME}touchpinch`,
  
    /**
     * http://hammerjs.github.io/recognizer-rotate/
     *  @type {String}
     */
    TOUCH_ROTATE: `${PROJECT_NAME}touchrotate`,
  
    /**
     * http://hammerjs.github.io/recognizer-press/
     *  @type {String}
     */
    TOUCH_PRESS: `${PROJECT_NAME}touchpress`,
  
    /**
     * http://hammerjs.github.io/recognizer-tap/
     *  @type {String}
     */
    TAP: `${PROJECT_NAME}tap`,
  
    /**
     *  @type {String}
     */
    DOUBLE_TAP: `${PROJECT_NAME}doubletap`,
  
    /**
     *  @type {String}
     */
    MULTI_TOUCH_START: `${PROJECT_NAME}multitouchstart`,
  
    /**
     *  @type {String}
     */
    MULTI_TOUCH_START_ACTIVE: `${PROJECT_NAME}multitouchstartactive`,
  
    /**
     *  @type {String}
     */
    MULTI_TOUCH_DRAG: `${PROJECT_NAME}multitouchdrag`,
  
    //
    // KEYBOARD
    //
  
    /**
     * https://developer.mozilla.org/en-US/docs/Web/Events/keydown
     *  @type {String}
     */
    KEY_DOWN: `${PROJECT_NAME}keydown`,
  
    /**
     * https://developer.mozilla.org/en-US/docs/Web/Events/keyup
     *  @type {String}
     */
    KEY_UP: `${PROJECT_NAME}keyup`,
  
    /**
     * https://developer.mozilla.org/en-US/docs/Web/Events/keypress
     *  @type {String}
     */
    KEY_PRESS: `${PROJECT_NAME}keypress`,
  
    //
    // CUSTOM
    //
  
    /**
     *  @type {String}
     */
    ROI_ADDED: `${PROJECT_NAME}roiadded`,
  
    /**
     *  @type {String}
     */
    ROI_REMOVED: `${PROJECT_NAME}roiremoved`,

    /**
     *  @type {String}
     */
    ROI_DRAW_STARTED: `${PROJECT_NAME}roidrawnstarted`,
    
    /**
     *  @type {String}
     */
    ROI_DRAWN: `${PROJECT_NAME}roidrawn`,

    /**
     *  @type {String}
     */
    ROI_SELECTED: `${PROJECT_NAME}roiselected`,

    /**
     *  @type {String}
     */
    ROI_MODIFIED: `${PROJECT_NAME}roimodified`,  

    /**
     *  @type {String}
     */
    DICOM_MOVE_STARTED: `${PROJECT_NAME}dicommovestarted`,  
    
    /**
     *  @type {String}
     */
    DICOM_MOVE_ENDED: `${PROJECT_NAME}dicommoveend`,  
    
  };
  
  export default EVENTS;