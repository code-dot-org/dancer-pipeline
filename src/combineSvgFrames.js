const svg2js = require('svgo/lib/svgo/svg2js');
const js2svg = require('svgo/lib/svgo/js2svg');

const asyncSvg2js = data => new Promise((resolve) => {
  svg2js(data, resolve);
});

module.exports = async (frames) => {
  let parent = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">';
  parent += Object.keys(frames).map(frameName => `<g id='${frameName}'></g>`);
  parent += '</svg>';

  const root = await asyncSvg2js(parent);

  for (const frameName of Object.keys(frames)) {
    const converted = await asyncSvg2js(frames[frameName]);
    const g = root.querySelector(`#${frameName}`);
    g.content = converted.querySelector('svg').content;
  }
  return js2svg(root).data;
};
