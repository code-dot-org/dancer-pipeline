const filesize = require('filesize');
const fs = require('fs');
const path = require('path');

module.exports = function writeToFile(filename, contents) {
  const dirname = path.dirname(filename);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, {recursive: true});
  }
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, contents, (err) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(`Wrote ${filename} (${filesize(contents.length)})`);
        resolve();
      }
    });
  });
};
