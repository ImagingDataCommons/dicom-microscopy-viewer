import dicomiccFactory from '@imagingdatacommons/dicomicc/dist/dicomiccwasm.js'
import { inlineBinaryToUint8Array } from './inlineBinaryToUint8Array.js'


/**
 * This file is intended to test the transformerICC module in isolation. We can do this by mocking the WASM module that it depends on, 
 *  which allows us to control the behavior of the codec and test how the transformer handles different scenarios, including edge cases and error conditions.
 *  This approach ensures that our tests are focused on the logic of the transformer itself, rather than being influenced by the complexities of the actual WASM implementation.
 */
jest.mock('@imagingdatacommons/dicomicc/dist/dicomiccwasm.wasm', () => 'wasm-mock', {
	virtual: true,
})
jest.mock('@imagingdatacommons/dicomicc/dist/dicomiccwasm.js', () => jest.fn())
jest.mock('./inlineBinaryToUint8Array.js', () => ({
	inlineBinaryToUint8Array: jest.fn(),
}))

import ColorTransformer from './transformerICC.js'

// Helper function to create some mock metadata and ICC profiles for testing
const createMetadata = () => ({
	Columns: 2,
	Rows: 2,
	BitsAllocated: 8,
	SamplesPerPixel: 3,
	PlanarConfiguration: 0,
	SOPInstanceUID: '1.2.3.4',
})

const createCodec = (outputTypeOverrides = {}) => {
	const outputTypes = {
		SRGB: 0,
		DISPLAY_P3: 1,
		ADOBE_RGB: 2,
		ROMM_RGB: 3,
		...outputTypeOverrides,
	}

    // Create mocked API for the WASM. Here, we can also implement edge cases, such as missing enums or methods, to test the transformer's error handling.
    // As far as the ColorTransformer is aware, this is the actual API and we can verify that the logic using it is correct.
	return {
		DcmIccOutputType: outputTypes,
		ColorManager: jest.fn().mockImplementation(() => ({
			transform: jest.fn((decodedFrame) => decodedFrame),
		})),
	}
}

describe('ColorTransformer', () => {
	let metadata
	let iccProfiles

	beforeEach(() => {
		jest.clearAllMocks()
		metadata = [createMetadata()]
		iccProfiles = [{ InlineBinary: 'AA==' }]
		inlineBinaryToUint8Array.mockReturnValue(new Uint8Array([0]))
	})

	it('uses SRGB by default', async () => {
		const codec = createCodec()
		dicomiccFactory.mockReturnValue(Promise.resolve(codec))

		const transformer = new ColorTransformer(metadata, iccProfiles)
		await transformer._initialize()

		expect(transformer.iccOutputType).toBe(codec.DcmIccOutputType.SRGB)
		expect(codec.ColorManager).toHaveBeenCalledWith(
			expect.any(Object),
			expect.any(Uint8Array),
			codec.DcmIccOutputType.SRGB,
		)
	})

	it.each([
		['display-p3', 'DISPLAY_P3'],
		['adobe-rgb', 'ADOBE_RGB'],
		['romm-rgb', 'ROMM_RGB'],
	])(
		'maps "%s" to codec output enum "%s"',
		async (requestedOutputType, expectedEnumKey) => {
			const codec = createCodec()
			dicomiccFactory.mockReturnValue(Promise.resolve(codec))

			const transformer = new ColorTransformer(
				metadata,
				iccProfiles,
				requestedOutputType,
			)
			await transformer._initialize()

			expect(transformer.iccOutputType).toBe(
				codec.DcmIccOutputType[expectedEnumKey],
			)
		},
	)

	it('falls back to SRGB for unsupported output type and warns', async () => {
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
		const codec = createCodec()
		dicomiccFactory.mockReturnValue(Promise.resolve(codec))

		const transformer = new ColorTransformer(metadata, iccProfiles, 'not-real')
		await transformer._initialize()

		expect(transformer.iccOutputType).toBe(codec.DcmIccOutputType.SRGB)
		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining('Unsupported ICC output type "not-real"'),
		)

		warnSpy.mockRestore()
	})

	it('falls back to SRGB when selected enum is missing in codec', async () => {
		const codec = createCodec({ DISPLAY_P3: undefined })
		dicomiccFactory.mockReturnValue(Promise.resolve(codec))

		const transformer = new ColorTransformer(metadata, iccProfiles, 'display-p3')
		await transformer._initialize()

		expect(transformer.iccOutputType).toBe(codec.DcmIccOutputType.SRGB)
	})

    // Test the assumptions about the codec's API and error handling when expected properties are missing. This ensures that our code fails gracefully and 
    // provides informative error messages to developers if the codec does not meet the expected interface.
	it('throws when codec does not expose DcmIccOutputType', async () => {
		const codec = {
			ColorManager: jest.fn(),
		}
		dicomiccFactory.mockReturnValue(Promise.resolve(codec))

		const transformer = new ColorTransformer(metadata, iccProfiles, 'srgb')

		await expect(transformer._initialize()).rejects.toThrow(
			'DcmIccOutputType enum is not available in the codec',
		)
	})

	it('throws when codec does not expose DcmIccOutputType.SRGB', async () => {
		const codec = createCodec({ SRGB: undefined })
		dicomiccFactory.mockReturnValue(Promise.resolve(codec))

		const transformer = new ColorTransformer(metadata, iccProfiles, 'srgb')

		await expect(transformer._initialize()).rejects.toThrow(
			'DcmIccOutputType.SRGB is not defined in the codec',
		)
	})
})
