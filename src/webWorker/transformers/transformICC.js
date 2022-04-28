import dicomiccFactory from 'dicomicc/dist/dicomiccwasm.js'
import dicomiccWASM from 'dicomicc/dist/dicomiccwasm.wasm'

const local = {
  codec: undefined,
  transformers: [],
};

function initialize(iccProfiles) {
  if (local.codec) {
    return Promise.resolve()
  }

  const dicomicc = dicomiccFactory({
    locateFile: (f) => {
      if (f.endsWith('.wasm')) {
        return dicomiccWASM
      }
      return f
    },
  });

  return new Promise((resolve, reject) => {
    dicomiccFactory.then((instance) => {
      local.codec = instance

      for (let iccProfileIndex = 0; iccProfileIndex < iccProfiles.length; iccProfileIndex++) {
        const image = iccProfiles[iccProfileIndex];

        local.transformers[image.SOPInstanceUID] = new dicomicc.ColorManager(
          {
            columns: image.Columns,
            rows: image.Rows,
            bitsPerSample: image.BitsAllocated,
            samplesPerPixel: image.SamplesPerPixel,
            planarConfiguration: image.PlanarConfiguration
          },
          image.iccProfile
        )
      }
    
      resolve(local.transformers)
    }, reject)
  });
}

/** Transform image.
 * 
 * @param {array} - images metadata with ICC profiles
 * @param {string} - sopInstanceUID
 * @param {Buffer} - decoded Frame
 *
 * @returns {Buffer} transformed buffer
 * @private
 */
 async function transformAsync(iccProfiles, sopInstanceUID, decodedFrame) {
  if (!iccProfiles || iccProfiles.length === 0) {
    return decodedFrame
  }

  if (!local.codec) {
    await initialize(iccProfiles)
  }

  let transformedFrame
  if (sopInstanceUID in local.transformers) {
    transformedFrame = local.transformers[sopInstanceUID].transform(decodedFrame)
  } else {
    transformedFrame = decodedFrame
  }
  
  return transformedFrame
}


export {
  transformAsync,
};