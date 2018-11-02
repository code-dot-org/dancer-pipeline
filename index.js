#!/usr/bin/env node
const yargs = require('yargs');
const processAllDancers = require('./src/processAllDancers');

yargs
  .command('*', 'Process all dancers', () => {}, processAllDancers)
  .parse();
