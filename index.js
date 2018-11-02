const files = require('./src/files');
const processDancer = require('./src/processDancer');

(async function main() {
  const dancerDirs = await files.listDancerInputDirectories();
  await Promise.all(dancerDirs.map(processDancer));
  console.log('Done.');
}());
