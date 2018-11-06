/* global document, lottie */
//
// Methods that run in the browser context of the renderer
// They can't share state with node-land anyway, except through passed arguments.
//

/**
 * @param {string} dancerName (also the directory name)
 * @param {string} fileName
 * @returns {Promise<Array<string>>} Resolves to an array of strings where each
 *   string is an SVG document representing one frame of the animation.
 */
async function renderAnimation(dancerName, fileName) {
  // Make render target for lottie-web
  const container = document.createElement('div');
  container.style.width = '400px';
  container.style.height = '400px';
  document.body.appendChild(container);

  // Load an animation
  const path = `/input/${dancerName}/${fileName}`;
  const json = await (await window.fetch(path)).json();
  const { layers } = json.assets[0];

  // Tag head and body
  layers.find(layer => /head/i.test(layer.nm)).cl = 'head';
  layers.find(layer => /body/i.test(layer.nm)).cl = 'body';

  // Render in bodymovin
  const animation = lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop: false,
    autoplay: false,
    animationData: json,
  });


  const lottieSVG = container.querySelector('svg');

  // Capture all frames of the animation
  const result = [];
  const { totalFrames } = animation;
  for (let i = 0; i < totalFrames; i += 2) {
    animation.goToAndStop(i, /* isFrame: */ true);
    result.push(lottieSVG.outerHTML);
  }
  document.body.removeChild(container);

  return result;
}

module.exports = {
  renderAnimation,
};
