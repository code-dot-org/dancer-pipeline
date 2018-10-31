const js2svg = require('svgo/lib/svgo/js2svg');
const svg2js = require('svgo/lib/svgo/svg2js');

const svg = `
  <defs></defs>
`;
console.log('Initial svg:', svg);

svg2js(svg, (result) => {
  console.log('JS representation:', result);

  const newSvg = js2svg(result).data;
  console.log('Restored:', newSvg);
});
