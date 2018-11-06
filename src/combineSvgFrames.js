const svg2js = require('svgo/lib/svgo/svg2js');
const js2svg = require('svgo/lib/svgo/js2svg');

const asyncSvg2js = data => new Promise((resolve) => {
  svg2js(data, resolve);
});

module.exports = async (moves_frames) => {
  let parent = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="480"
      height="480"
      viewBox="0 0 9600 9600"
    >`;
  parent += Object.keys(moves_frames).map((moveName) => {
    return Object.keys(moves_frames[moveName]).map(frameName => `<g id='${frameName}'></g>`).join('');
  }).join('');
  parent += '</svg>';

  const root = await asyncSvg2js(parent);

  let row = 0;
  for (const moveName of Object.keys(moves_frames)) {
    let column = 0;
    const moveFrames = moves_frames[moveName];
    for (const frameName of Object.keys(moveFrames)) {
      const converted = await asyncSvg2js(moveFrames[frameName]);
      const g = root.querySelector(`#${frameName}`);
      g.attrs.transform = { name: 'transform', value: `translate(${column * 400}, ${row * 400})` };
      g.content = converted.querySelector('svg').content;
      column++;
    }
    row++;
  }
  return js2svg(root).data;
};
