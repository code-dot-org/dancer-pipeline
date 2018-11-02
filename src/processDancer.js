const Renderer = require('./Renderer');
const { optimizeSvg, finalPass } = require('./optimizeSvg');
const combineSvgFrames = require('./combineSvgFrames');
const writeFile = require('./writeFile');

/**
 * Locates all animation.json files for a character,
 * renders them each into SVG,
 * combines those into one SVG with a named group for each animation frame,
 * and optimizes the SVG to be ready for distribution.
 *
 * @param {string} name - Should match the directory name containing the animation
 *   json files and the character part of the json filename.
 * @return {Promise} resolved when final SVG has been written.
 */
module.exports = async function processDancer(name) {
  const moveNames = [
    'claphigh',
    'clown',
    'dab',
    'doublejam',
    'drop',
    'floss',
    'fresh',
    'kick',
    'rest',
    'roll',
    'thisorthat',
    'thriller',
    'xarmsside',
    'xarmsup',
    'xclapside',
    'xheadhips',
    'xhighkick',
    'xjump',
  ];

  const renderer = new Renderer();
  await renderer.initialize();
  const svgFrames = {};
  for (let i = 0; i < moveNames.length; i++) {
    const move = moveNames[i];
    console.log(`Rendering ${name} ${move}...`);
    const frames = await renderer.renderAnimation(`${name}_${move}`);
    for (let j = 0; j < frames.length; j++) {
      svgFrames[`${move}_${j}`] = await optimizeSvg(frames[j]);
    }
  }
  await renderer.shutdown();

  const flattened = await combineSvgFrames(svgFrames);
  const final = await finalPass(flattened);
  await writeFile(`output/${name}.min.svg`, final);
};
