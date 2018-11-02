const fs = require('fs');
const filesize = require('filesize');
const path = require('path');

const INPUT_DIR = 'input';
const OUTPUT_DIR = 'output';

function listDancerInputDirectories() {
  return new Promise((resolve, reject) => {
    fs.readdir(`${INPUT_DIR}/`, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

function listDancerInputFiles(directory) {
  return new Promise((resolve, reject) => {
    fs.readdir(`${INPUT_DIR}/${directory}/`, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files.filter(file => /\.json$/i.test(file)));
      }
    });
  });
}

function writeDancerOutput(dancerName, contents) {
  const fileName = `${OUTPUT_DIR}/${dancerName.toLowerCase()}.svg`;
  const dirname = path.dirname(fileName);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, contents, (err) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(`Wrote ${fileName} (${filesize(contents.length)})`);
        resolve();
      }
    });
  });
}

module.exports = {
  listDancerInputDirectories,
  listDancerInputFiles,
  writeDancerOutput,
};
