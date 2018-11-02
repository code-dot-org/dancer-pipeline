const svg2js = require('svgo/lib/svgo/svg2js');
const js2svg = require('svgo/lib/svgo/js2svg');

const asyncSvg2js = data => new Promise((resolve) => {
  svg2js(data, resolve);
});

module.exports = async (frames) => {
  let parent = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="480"
      height="480"
      viewBox="0 0 9600 9600"
    >`;
  parent += Object.keys(frames).map(frameName => `<g id='${frameName}'></g>`).join('\n');
  parent += '</svg>';

  const root = await asyncSvg2js(parent);

  let row = 0;
  let column = 0;
  let lastAnimationName = Object.keys(frames)[0].split('_')[0];
  for (const frameName of Object.keys(frames)) {
    const animationName = frameName.split('_')[0];
    if (animationName !== lastAnimationName) {
      column = 0;
      row++;
    }
    const converted = await asyncSvg2js(frames[frameName]);
    const g = root.querySelector(`#${frameName}`);
    g.attrs.transform = {name: 'transform', value: `translate(${column * 400}, ${row * 400})`};
    g.content = converted.querySelector('svg').content;
    column++;
    lastAnimationName = animationName;
  }
  return js2svg(root).data;
};
