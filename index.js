// const jsdom = require('jsdom');
// const lottie = require('lottie-web');
// console.log(typeof lottie);
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:8081/index.html');

    const result = await page.evaluate(() => {
        const container = document.createElement('div')
        container.style.width = '400px';
        container.style.height = '400px';
        document.body.appendChild(container);

        const animation = lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: 'test/fixtures/cat_claphigh.json'
        });

        return new Promise(resolve => {
           animation.addEventListener('DOMLoaded', () => {
               resolve(container.querySelector('svg').outerHTML);
           });
        });

        //
        // const events = ['DOMLoaded', 'enterFrame', 'config_ready', 'data_ready'];
        // events.forEach(eventName => {
        //     animation.addEventListener(eventName, () => {
        //         console.groupCollapsed(eventName);
        //         console.log('animation', animation);
        //         console.log(document.querySelector('svg').outerHTML);
        //         console.groupEnd();
        //     })
        // });
    });

    console.log(result);


    await browser.close();
})();

