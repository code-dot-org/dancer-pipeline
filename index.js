const {optimizeSvg, finalPass} = require('./src/optimizeSvg');
const combineSvgFrames = require('./src/combineSvgFrames');
const writeFile = require('./src/writeFile');
const Renderer = require('./src/Renderer');

const renderer = new Renderer();

(async function () {
  const dancerName = 'cat';
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

  await renderer.initialize();

  const svgFrames = {};
  for (let i = 0; i < moveNames.length; i++) {
    const move = moveNames[i];
    console.log(`Rendering ${dancerName} ${move}...`);
    const frames = await renderer.renderAnimation(`${dancerName}_${move}`);
    for (let j = 0; j < frames.length; j++) {
      svgFrames[`${move}_${j}`] = await optimizeSvg(frames[j]);
    }
  }

  const flattened = await combineSvgFrames(svgFrames);
  const final = await finalPass(flattened);
  await writeFile(`output/${dancerName}.min.svg`, final);

  await renderer.shutdown();
}());
