const filesize = require('filesize');
const fs = require('fs');
const puppeteer = require('puppeteer');

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
    await page.evaluate(async (filename) => {
      /* global document, lottie, window */
      const SVGNS = 'http://www.w3.org/2000/svg';

      const { outputSVG } = window;

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
      const { totalFrames } = animation;
      for (let i = 0; i < totalFrames; i++) {
        animation.goToAndStop(i, /* isFrame: */ true);
        // Clone the whole SVG contents into a new group in the output svg
        const frameGroup = document.createElementNS(SVGNS, 'g');
        frameGroup.id = `${filename}_${i.toString(10).padStart(2, '0')}`;
        lottieSVG.childNodes.forEach((child) => {
          if (child.nodeName === 'defs') {
            if (i === 0) {
              outputSVG.appendChild(child.cloneNode(true));
            }
          } else {
            frameGroup.appendChild(child.cloneNode(true));
          }
        });
        outputSVG.appendChild(frameGroup);
      }

      document.body.removeChild(container);
    }, filename);
  }

  function retrieveSvgMarkup() {
    return page.evaluate(() => {
      /* global window */
      const { outputSVG } = window;
      return outputSVG.outerHTML;
    });
  }

  async function writeToFile(filename, contents) {
    await new Promise((resolve, reject) => {
      fs.writeFile(filename, contents, (err) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log(`Wrote ${filename} (${filesize(contents.length)})`);
          resolve();
        }
      });
    });
  }

  const dancerName = 'cat';
  const moveNames = ['claphigh', 'clown', 'dab', 'doublejam', 'drop', 'floss',
    'fresh', 'kick', 'rest', 'roll', 'thisorthat', 'thriller', 'xarmsside',
    'xarmsup', 'xclapside', 'xheadhips', 'xhighkick', 'xjump'];

  await setup();
  for (let i = 0; i < moveNames.length; i++) {
    await renderAnimation(`${dancerName}_${moveNames[i]}`);
  }

  const result = await retrieveSvgMarkup();
  const outputFilename = `output/${dancerName}.svg`;
  await writeToFile(outputFilename, result);

  await browser.close();
}());
