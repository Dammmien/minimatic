#!/usr/bin/env node

const Builder = require('./Builder');
const fs = require('fs');

const package = JSON.parse(fs.readFileSync(`${process.cwd()}/package.json`));
const config = package.config;

config.src = config.src ? `${process.cwd()}/${config.src}` : process.cwd();
config.output = config.output ? `${process.cwd()}/${config.output}` : `${process.cwd()}/www`;

const builder = new Builder(config);

builder.build();
