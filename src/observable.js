const _value = Symbol('value')
const _subscribers = Symbol('subscribers')

/**
 * A self-contained, DOM-independent reactive value store.
 *
 * An `Observable` holds a single value of any type. Subscribers are notified
 * asynchronously (via microtask) whenever the value is replaced with a value
 * that is not strictly equal (`!==`) to the previous one. Objects are treated
 * as atomic entities: any new reference triggers a notification regardless of
 * whether the object's contents changed.
 *
 * @example
 * const obs = new Observable(0)
 * const unsubscribe = obs.subscribe((newValue, oldValue) => {
 *   console.log(newValue, oldValue)
 * })
 * obs.setValue(1) // subscriber called asynchronously with (1, 0)
 * unsubscribe()
 */
class Observable {
  /**
   * @param {*} initialValue - The initial value held by this observable.
   */
  constructor(initialValue) {
    this[_value] = initialValue
    this[_subscribers] = []
  }

  /**
   * Returns the current value.
   *
   * @returns {*} The current value.
   */
  getValue() {
    return this[_value]
  }

  /**
   * Replaces the current value. If the new value is strictly unequal (`!==`)
   * to the previous value, all subscribers are notified asynchronously via a
   * microtask (`Promise.resolve().then(...)`).
   *
   * @param {*} value - The new value.
   */
  setValue(value) {
    const previous = this[_value]
    if (value === previous) {
      return
    }
    this[_value] = value
    const callbacks = this[_subscribers].slice()
    Promise.resolve().then(() => {
      for (const cb of callbacks) {
        cb(value, previous)
      }
    })
  }

  /**
   * Registers a subscriber callback that is called whenever the value changes.
   * The callback receives `(newValue, oldValue)` as arguments.
   *
   * @param {function(*,*): void} callback - The function to call on value change.
   * @returns {function(): void} A convenience function that unsubscribes the callback when called.
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Observable.subscribe: callback must be a function')
    }
    this[_subscribers].push(callback)
    return () => this.unsubscribe(callback)
  }

  /**
   * Removes a previously registered subscriber callback. If the callback is
   * not found, this is a no-op.
   *
   * @param {function(*,*): void} callback - The callback to remove.
   */
  unsubscribe(callback) {
    const idx = this[_subscribers].indexOf(callback)
    if (idx !== -1) {
      this[_subscribers].splice(idx, 1)
    }
  }

  /**
   * Removes all subscribers and resets the stored value to `undefined`.
   * After calling `destroy`, the observable should not be used further.
   */
  destroy() {
    this[_subscribers] = []
    this[_value] = undefined
  }
}

export { Observable }
export default Observable
