const puppeteer = require('puppeteer');
const {optimizeSvg, finalPass} = require('./src/optimizeSvg');
const combineSvgFrames = require('./src/combineSvgFrames');
const writeFile = require('./src/writeFile');

(async function () {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8081/index.html');

  async function setup() {
    await page.evaluate(() => {
      /* global document, window */
      const SVGNS = 'http://www.w3.org/2000/svg';

      // Make destination SVG
      window.outputSVG = document.createElementNS(SVGNS, 'svg');
      window.outputSVG.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      window.outputSVG.setAttribute('viewBox', '0 0 400 400');
      window.outputSVG.setAttribute('width', '400');
      window.outputSVG.setAttribute('height', '400');
      window.outputSVG.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    });
  }

  async function renderAnimation(filename) {
    // eslint-disable-next-line no-shadow
    return page.evaluate(async (filename) => {
      /* global document, lottie, window */

      // Make render target for lottie-web
      const container = document.createElement('div');
      container.style.width = '400px';
      container.style.height = '400px';
      document.body.appendChild(container);

      // Load an animation
      const animation = lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: `test/fixtures/${filename}.json`,
      });

      // Wait for that animation to be ready
      await new Promise(resolve => animation.addEventListener('DOMLoaded', resolve));

      const lottieSVG = container.querySelector('svg');

      // Capture all frames of the animation
      const result = [];
      const { totalFrames } = animation;
      for (let i = 0; i < totalFrames; i++) {
        animation.goToAndStop(i, /* isFrame: */ true);
        result.push(lottieSVG.outerHTML);
      }
      document.body.removeChild(container);

      return result;
    }, filename);
  }

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

  await setup();
  const svgFrames = {};

  for (let i = 0; i < moveNames.length; i++) {
    const move = moveNames[i];
    console.log(`Rendering ${dancerName} ${move}...`);
    const frames = await renderAnimation(`${dancerName}_${move}`);
    for (let j = 0; j < frames.length; j++) {
      svgFrames[`${move}_${j}`] = await optimizeSvg(frames[j]);
    }
  }

  const flattened = await combineSvgFrames(svgFrames);
  const final = await finalPass(flattened);
  await writeFile(`output/${dancerName}.min.svg`, final);

  await browser.close();
}());