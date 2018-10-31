const SVGO = require('svgo');

/**
 * Use SVGO to optimize an SVG document
 * Runs in nodejs - no browser required.
 * @param {string} input - a raw SVG document
 * @return {Promise.<{data: string}>}
 */
module.exports = function optimizeSvg(input) {
  const svgo = new SVGO({
    js2svg: {
      pretty: true,
      indent: 2,
    },
    multipass: true,
    floatPrecision: 2,
    plugins: [{
      removeAttrs: {
        attrs: ['clip-path', 'display', 'style'],
      },
    }],
  });
  return svgo.optimize(input).then(result => result.data);
};
