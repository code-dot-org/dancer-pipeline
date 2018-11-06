const files = require('./files');
const Renderer = require('./Renderer');
const { optimizeSvg, finalPass } = require('./optimizeSvg');
const combineSvgFrames = require('./combineSvgFrames');

module.exports = async function processAllDancers(/* argv */) {
  const dancerDirs = await files.listDancerInputDirectories();
  await Promise.all(dancerDirs.map(processDancer));
  console.log('Done.');
};

/**
 * Locates all animation.json files for a character,
 * renders them each into SVG,
 * combines those into one SVG with a named group for each animation frame,
 * and optimizes the SVG to be ready for distribution.
 *
 * @param {string} dancerName - Should also be the directory name containing the animation
 * json files.
 * @return {Promise} resolved when final SVG has been written.
 */
async function processDancer(dancerName) {
  try {
    const inputFiles = await files.listDancerInputFiles(dancerName);
    const renderer = new Renderer();
    await renderer.initialize();

    // Structured:
    // {
    //   "moveName": {
    //     "moveName_frameNum": svgString
    //   }
    // }
    const svgFrames = {};
    for (let i = 0; i < inputFiles.length; i++) {
      const fileName = inputFiles[i];
      const move = moveName(dancerName, fileName);
      console.log(`Rendering ${fileName}`);
      const frames = await renderer.renderAnimation(dancerName, fileName);
      // If we get a string back, an error occurred
      if (typeof frames === 'string') {
        throw new Error(frames);
      }
      svgFrames[move.toLowerCase()] = {};
      for (let j = 0; j < frames.length; j++) {
        svgFrames[move.toLowerCase()][`${move.toLowerCase()}_${j}`] = await optimizeSvg(frames[j]);
      }
    }
    await renderer.shutdown();

    const flattened = await combineSvgFrames(svgFrames);
    const final = await finalPass(flattened);
    await files.writeDancerOutput(dancerName, final);
  } catch (error) {
    console.log(`There was an error while processing ${dancerName}: ${error}`);
  }
}

function moveName(dancerName, fileName) {
  const match = /^[^_]+_(.*)\.json$/i.exec(fileName);
  return match && match[1];
}
