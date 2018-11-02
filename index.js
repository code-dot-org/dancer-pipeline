#!/usr/bin/env node
const yargs = require('yargs');
const processAllDancers = require('./src/processAllDancers');
const previewOutputFiles = require('./src/previewOutputFiles');

yargs
  .command(
    '*',
    'Process all dancers',
    () => {},
    processAllDancers,
  )
  .command(
    'preview',
    'Preview output files',
    builder => builder
      .option('speed', {
        default: 1,
        describe: 'Playback speed',
        type: 'number',
      }),
    previewOutputFiles,
  )
  .parse();
