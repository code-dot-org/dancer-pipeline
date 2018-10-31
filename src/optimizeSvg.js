const SVGO = require('svgo');
const dedupeToDefs = require('./dedupeToDefs');

/**
 * Use SVGO to optimize an SVG document
 * Runs in nodejs - no browser required.
 * @param {string} input - a raw SVG document
 * @return {Promise.<{data: string}>}
 */
function optimizeSvg(input) {
  const svgo = new SVGO({
    js2svg: {
      pretty: true,
      indent: 2,
    },
    multipass: true,
    floatPrecision: 2,
    plugins: [
      {
        removeAttrs: {attrs: ['clip-path', 'display', 'style']},
      },
      {
        moveGroupAttrsToElems: false,
      },
    ],
  });
  return svgo.optimize(input).then(result => result.data);
};

async function finalPass(input) {
  const dedupeSvgo = new SVGO({
    full: true,
    js2svg: {
      pretty: true,
      indent: 2,
    },
    floatPrecision: 2,
    plugins: [
      {
        dedupeToDefs,
      },
    ],
  });

  const deduped = await dedupeSvgo.optimize(input).then(result => result.data);

  const svgo = new SVGO({
    js2svg: {
      pretty: true,
      indent: 2,
    },
    floatPrecision: 2,
    plugins: [
      {
        cleanupIDs: false,
      },
    ],
  });

  return svgo.optimize(deduped).then(result => result.data);


}

module.exports = {
  optimizeSvg,
  finalPass
}