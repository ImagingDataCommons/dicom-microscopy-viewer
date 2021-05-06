/**
 * Triggers a CustomEvent.
 *
 * @param {EventTarget} el The element or EventTarget to trigger the event upon
 * @param {string} type The event type name
 * @param {Object|null} payload=null The event data to be sent
 * @returns {boolean} The return value is false if at least one event listener called preventDefault(). Otherwise it returns true.
 * @private
 */
const publish = (el, type, payload = null) => {
  let event

  const detail = {
    payload,
    time: new Date()
  }

  // This check is needed to polyfill CustomEvent on IE11-
  if (typeof window.CustomEvent === 'function') {
    event = new CustomEvent(type, {// eslint-disable-line
      detail,
      bubbles: true,
      cancelable: true
    })
  } else {
    event = document.createEvent('CustomEvent')
    event.initCustomEvent(type, true, true, detail)
  }

  return el.dispatchEvent(event)
}

export default publish
