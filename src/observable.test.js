const { Observable } = require('./observable')

describe('Observable', () => {
  describe('getValue', () => {
    it('returns the initial value', () => {
      const obs = new Observable(42)
      expect(obs.getValue()).toBe(42)
    })

    it('returns undefined when constructed without an argument', () => {
      const obs = new Observable()
      expect(obs.getValue()).toBeUndefined()
    })

    it('returns the initial object reference', () => {
      const obj = { x: 1 }
      const obs = new Observable(obj)
      expect(obs.getValue()).toBe(obj)
    })
  })

  describe('setValue', () => {
    it('updates the value synchronously', () => {
      const obs = new Observable(0)
      obs.setValue(99)
      expect(obs.getValue()).toBe(99)
    })

    it('notifies subscribers asynchronously after value changes', async () => {
      const obs = new Observable(0)
      const calls = []
      obs.subscribe((newVal, oldVal) => calls.push({ newVal, oldVal }))

      obs.setValue(1)
      expect(calls).toHaveLength(0) // not yet — microtask pending

      await Promise.resolve()
      expect(calls).toHaveLength(1)
      expect(calls[0]).toEqual({ newVal: 1, oldVal: 0 })
    })

    it('does not notify when the value is strictly equal', async () => {
      const obs = new Observable(5)
      const calls = []
      obs.subscribe(() => calls.push(true))

      obs.setValue(5)
      await Promise.resolve()
      expect(calls).toHaveLength(0)
    })

    it('does not notify when the same object reference is re-set', async () => {
      const obj = { a: 1 }
      const obs = new Observable(obj)
      const calls = []
      obs.subscribe(() => calls.push(true))

      obs.setValue(obj)
      await Promise.resolve()
      expect(calls).toHaveLength(0)
    })

    it('notifies when a new object reference is set even if contents are equal', async () => {
      const obs = new Observable({ a: 1 })
      const calls = []
      obs.subscribe(() => calls.push(true))

      obs.setValue({ a: 1 }) // different reference
      await Promise.resolve()
      expect(calls).toHaveLength(1)
    })

    it('notifies each setValue call independently as separate microtasks', async () => {
      const obs = new Observable(0)
      const received = []
      obs.subscribe((val) => received.push(val))

      obs.setValue(1)
      obs.setValue(2)
      obs.setValue(3)

      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()

      expect(received).toEqual([1, 2, 3])
    })
  })

  describe('subscribe', () => {
    it('calls all registered subscribers on value change', async () => {
      const obs = new Observable('a')
      const calls = []
      obs.subscribe((v) => calls.push(`cb1:${v}`))
      obs.subscribe((v) => calls.push(`cb2:${v}`))

      obs.setValue('b')
      await Promise.resolve()
      expect(calls).toEqual(['cb1:b', 'cb2:b'])
    })

    it('throws if the callback is not a function', () => {
      const obs = new Observable(0)
      expect(() => obs.subscribe('not-a-function')).toThrow(TypeError)
    })

    it('returns an unsubscribe function', async () => {
      const obs = new Observable(0)
      const calls = []
      const unsubscribe = obs.subscribe((v) => calls.push(v))

      obs.setValue(1)
      await Promise.resolve()
      expect(calls).toHaveLength(1)

      unsubscribe()
      obs.setValue(2)
      await Promise.resolve()
      expect(calls).toHaveLength(1) // no new call
    })
  })

  describe('unsubscribe', () => {
    it('stops the callback from receiving future notifications', async () => {
      const obs = new Observable(0)
      const calls = []
      const cb = (v) => calls.push(v)
      obs.subscribe(cb)

      obs.setValue(1)
      await Promise.resolve()
      expect(calls).toHaveLength(1)

      obs.unsubscribe(cb)
      obs.setValue(2)
      await Promise.resolve()
      expect(calls).toHaveLength(1)
    })

    it('is a no-op when the callback was never subscribed', () => {
      const obs = new Observable(0)
      expect(() => obs.unsubscribe(() => {})).not.toThrow()
    })

    it('only removes one instance when the same callback is subscribed once', async () => {
      const obs = new Observable(0)
      const calls = []
      const cb = (v) => calls.push(v)
      obs.subscribe(cb)
      obs.subscribe(cb)

      obs.unsubscribe(cb)

      obs.setValue(1)
      await Promise.resolve()
      expect(calls).toHaveLength(1) // second subscription still active
    })
  })

  describe('destroy', () => {
    it('stops all subscribers from receiving notifications', async () => {
      const obs = new Observable(0)
      const calls = []
      obs.subscribe((v) => calls.push(v))
      obs.subscribe((v) => calls.push(v))

      obs.destroy()
      obs.setValue(1)
      await Promise.resolve()
      expect(calls).toHaveLength(0)
    })

    it('resets the stored value to undefined', () => {
      const obs = new Observable(42)
      obs.destroy()
      expect(obs.getValue()).toBeUndefined()
    })
  })
})
