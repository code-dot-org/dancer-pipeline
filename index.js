const puppeteer = require('puppeteer');

async function withPage(url, callback) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await callback(page);
  await browser.close();
}

(async function() {
  await withPage('http://localhost:8081/index.html', async (page) => {
    const result = await page.evaluate(async () => {
      /* global document, lottie */

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
        path: 'test/fixtures/cat_claphigh.json',
      });

      // Wait for that animation to be ready
      await new Promise(resolve => animation.addEventListener('DOMLoaded', resolve));

      // Capture all frames of the animation
      const frameSvgs = [];
      const {totalFrames} = animation;
      for (var i = 0; i < totalFrames; i++) {
        animation.goToAndStop(i, /* isFrame: */ true);
        frameSvgs.push(container.querySelector('svg').outerHTML);
      }

      return frameSvgs;
    });

    console.log(result);
    console.log('--- found frames ---');
    console.log(result.length);
  });
}());
