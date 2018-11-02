const puppeteer = require('puppeteer');
const browser = require('./Renderer.browser');

module.exports = class Renderer {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
    await this.page.goto('http://localhost:8081/src/Renderer.html');
  }

  async renderAnimation(filename) {
    return this.page.evaluate(browser.renderAnimation, filename);
  }

  async shutdown() {
    await this.browser.close();
  }
};
