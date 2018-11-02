const processDancer = require('./src/processDancer');


(async function main() {
  await processDancer('bear');
  await processDancer('cat');
  await processDancer('dog');
  await processDancer('duck');
  await processDancer('frog');
  await processDancer('moose');
  await processDancer('robot');
  await processDancer('unicorn');
}());
