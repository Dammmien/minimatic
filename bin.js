#!/usr/bin/env node

const Minimatic = require('./index.js');
const [configPath, ...args] = process.argv.slice(2);
const config = require(`${process.cwd()}/${configPath}`);
const minimatic = new Minimatic(config);

minimatic.build(
  args.includes('--watch'),
  args.includes('--serve')
);
