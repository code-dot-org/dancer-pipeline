const fs = require('fs');
const puppeteer = require('puppeteer');

async function withPage(url, callback) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await callback(page);
  await browser.close();
}

(async function () {
  await withPage('http://localhost:8081/index.html', async (page) => {
    const result = await page.evaluate(async () => {
      /* global document, lottie */
      const SVGNS = 'http://www.w3.org/2000/svg';

      // Make render target for lottie-web
      const container = document.createElement('div');
      container.style.width = '400px';
      container.style.height = '400px';
      document.body.appendChild(container);

      // Make destination SVG
      const outputSVG = document.createElementNS(SVGNS, 'svg');
      outputSVG.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      outputSVG.setAttribute('viewBox', '0 0 400 400');
      outputSVG.setAttribute('width', '400');
      outputSVG.setAttribute('height', '400');
      outputSVG.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      // Load an animation
      const animation = lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: 'test/fixtures/cat_claphigh.json',
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
        frameGroup.id = `cat_claphigh_${i.toString(10).padStart(2, '0')}`;
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

      return outputSVG.outerHTML;
    });

    await new Promise((resolve, reject) => fs.writeFile('output/cat_claphigh.svg', result, err => (err ? reject(err) : resolve())));
    console.log('written to output/cat_claphigh.svg');
  });
}());
