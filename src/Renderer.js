const puppeteer = require('puppeteer');
const browser = require('./Renderer.browser');

module.exports = class Renderer {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    // Use this form for debugging rendering problems in the browser.
    // this.browser = await puppeteer.launch({headless: false});
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
    await this.page.goto('http://localhost:8081/src/Renderer.html');
  }

  async renderAnimation(dancerName, fileName) {
    return this.page.evaluate(browser.renderAnimation, dancerName, fileName);
  }

  async shutdown() {
    await this.browser.close();
  }
};
