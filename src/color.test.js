const { PaletteColorLookupTable } = require('./color')

describe('color.PaletteColorLookupTable', () => {
  it('interprets non-segmented 8-bit LUT data (descriptor [n, first, 8])', () => {
    // 256 entries of 8-bit values forming a ramp 0..255.
    const descriptor = [256, 0, 8]
    const ramp = new Uint8Array(256)
    for (let i = 0; i < 256; i++) {
      ramp[i] = i
    }
    const lut = new PaletteColorLookupTable({
      uid: '1.2.3',
      redDescriptor: descriptor,
      greenDescriptor: descriptor,
      blueDescriptor: descriptor,
      redData: ramp,
      greenData: ramp.slice(),
      blueData: ramp.slice()
    })
    expect(lut.data.length).toBe(256)
    expect(lut.data[0]).toEqual([0, 0, 0])
    expect(lut.data[255]).toEqual([255, 255, 255])
  })

  it('interprets 8-bit LUT data byte-packed in an OW ArrayBuffer', () => {
    // Conformant Presentation States encode 8-bit entries inside an OW element,
    // which arrives as a raw ArrayBuffer (e.g. via dcmjs readFile). A 256-entry
    // 8-bit LUT therefore occupies 256 bytes and must NOT be read as 128 16-bit
    // words.
    const descriptor = [256, 0, 8]
    const bytes = new Uint8Array(256)
    for (let i = 0; i < 256; i++) {
      bytes[i] = i
    }
    const buffer = bytes.buffer
    const lut = new PaletteColorLookupTable({
      uid: '1.2.3',
      redDescriptor: descriptor,
      greenDescriptor: descriptor,
      blueDescriptor: descriptor,
      redData: buffer,
      greenData: bytes.slice().buffer,
      blueData: bytes.slice().buffer
    })
    expect(lut.data.length).toBe(256)
    expect(lut.data[0]).toEqual([0, 0, 0])
    expect(lut.data[255]).toEqual([255, 255, 255])
  })

  it('reinterprets a Uint16Array that actually holds byte-packed 8-bit entries', () => {
    // Reproduces the failure mode where a 256-byte OW LUT was eagerly wrapped
    // in a Uint16Array (yielding 128 elements) before reaching the LUT.
    const descriptor = [256, 0, 8]
    const bytes = new Uint8Array(256)
    for (let i = 0; i < 256; i++) {
      bytes[i] = i
    }
    const packed = new Uint16Array(bytes.buffer) // length 128
    expect(packed.length).toBe(128)
    const lut = new PaletteColorLookupTable({
      uid: '1.2.3',
      redDescriptor: descriptor,
      greenDescriptor: descriptor,
      blueDescriptor: descriptor,
      redData: packed,
      greenData: new Uint16Array(bytes.slice().buffer),
      blueData: new Uint16Array(bytes.slice().buffer)
    })
    expect(lut.data.length).toBe(256)
    expect(lut.data[255]).toEqual([255, 255, 255])
  })

  it('interprets non-segmented 16-bit LUT data from an ArrayBuffer', () => {
    const descriptor = [256, 0, 16]
    const values = new Uint16Array(256)
    for (let i = 0; i < 256; i++) {
      values[i] = Math.round((i / 255) * 65535)
    }
    const lut = new PaletteColorLookupTable({
      uid: '1.2.3',
      redDescriptor: descriptor,
      greenDescriptor: descriptor,
      blueDescriptor: descriptor,
      redData: values.buffer,
      greenData: values.slice().buffer,
      blueData: values.slice().buffer
    })
    expect(lut.data.length).toBe(256)
    // 16-bit values are rescaled to 8-bit output.
    expect(lut.data[255]).toEqual([255, 255, 255])
  })

  it('throws when the data length does not match the descriptor', () => {
    const descriptor = [256, 0, 8]
    expect(() => {
      // eslint-disable-next-line no-new
      new PaletteColorLookupTable({
        uid: '1.2.3',
        redDescriptor: descriptor,
        greenDescriptor: descriptor,
        blueDescriptor: descriptor,
        redData: new Uint8Array(10),
        greenData: new Uint8Array(10),
        blueData: new Uint8Array(10)
      })
    }).toThrow(/wrong number of entries/)
  })
})
