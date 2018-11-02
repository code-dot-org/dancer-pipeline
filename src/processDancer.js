const fs = require('fs');
const Renderer = require('./Renderer');
const { optimizeSvg, finalPass } = require('./optimizeSvg');
const combineSvgFrames = require('./combineSvgFrames');
const writeFile = require('./writeFile');

function moveName(dancerName, fileName) {
  const re = new RegExp(`^${dancerName}_(.*).json$`, 'i');
  const match = re.exec(fileName);
  return match && match[1];
}

function inputFiles(dancerName) {
  return new Promise((resolve, reject) => {
    fs.readdir(`input/${dancerName}/`, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files.filter(x => moveName(dancerName, x)));
      }
    });
  });
}

/**
 * Locates all animation.json files for a character,
 * renders them each into SVG,
 * combines those into one SVG with a named group for each animation frame,
 * and optimizes the SVG to be ready for distribution.
 *
 * @param {string} dancerName - Should match the directory name containing the animation
 *   json files and the character part of the json filename.
 * @return {Promise} resolved when final SVG has been written.
 */
module.exports = async function processDancer(dancerName) {
  try {
    const files = await inputFiles(dancerName);
    const renderer = new Renderer();
    await renderer.initialize();
    const svgFrames = {};
    for (let i = 0; i < files.length; i++) {
      const fileName = files[i];
      const move = moveName(dancerName, fileName);
      console.log(`Rendering ${dancerName} ${move}...`);
      const frames = await renderer.renderAnimation(dancerName, fileName);
      // If we get a string back, an error occurred
      if (typeof frames === 'string') {
        throw new Error(frames);
      }
      for (let j = 0; j < frames.length; j++) {
        svgFrames[`${move}_${j}`] = await optimizeSvg(frames[j]);
      }
    }
    await renderer.shutdown();

    const flattened = await combineSvgFrames(svgFrames);
    const final = await finalPass(flattened);
    await writeFile(`output/${dancerName}.svg`, final);
  } catch (error) {
    console.log(`There was an error while processing ${dancerName}: ${error}`);
  }
};
