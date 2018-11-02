const puppeteer = require('puppeteer');
const files = require('./files');
const playAnimations = require('./playAnimations.browser');

module.exports = async function previewOutputFiles(argv) {
  const outputFiles = await files.listDancerOutputFiles();
  for (const file of outputFiles) {
    await previewOutputFile(file, argv.speed);
  }
};

async function previewOutputFile(fileName, speed) {
  const browser = await puppeteer.launch({ headless: false });

  try {
    const page = await browser.newPage();
    await page.goto(`http://localhost:8081/output/${fileName}`);
    await page.evaluate(playAnimations, speed);
  } catch (e) {
    console.log(e);
  }

  if (browser) {
    await browser.close();
  }
}
