import { isHTJ2K, isJPEGXL } from './frameMediaType.js'

describe('frame media type detection', () => {
  test('detects JPEG XL code streams and containers, and not JPEG', () => {
    expect(isJPEGXL(new Uint8Array([0xff, 0x0a, 0xfa, 0x1f]))).toBe(true)
    expect(
      isJPEGXL(
        new Uint8Array([
          0x00, 0x00, 0x00, 0x0c, 0x4a, 0x58, 0x4c, 0x20, 0x0d, 0x0a, 0x87,
          0x0a, 0x00,
        ]),
      ),
    ).toBe(true)
    expect(isJPEGXL(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe(false)
  })

  test('detects HTJ2K by the CAP marker, and not plain JPEG 2000', () => {
    /** SOC, SIZ (length 4), then CAP or COD (length 4), then SOT */
    const codeStream = (marker) =>
      new Uint8Array([
        0xff, 0x4f, 0xff, 0x51, 0x00, 0x04, 0x00, 0x00, 0xff, marker, 0x00,
        0x04, 0x00, 0x00, 0xff, 0x90, 0x00, 0x0a,
      ])
    expect(isHTJ2K(codeStream(0x50))).toBe(true)
    expect(isHTJ2K(codeStream(0x52))).toBe(false)
  })
})
