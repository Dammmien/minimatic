#!/usr/bin/env node

const Builder = require('./Builder');
const fs = require('fs');

const package = JSON.parse(fs.readFileSync(`${process.cwd()}/package.json`));
const config = package.config;

config.src = `${process.cwd()}/${config.src}`;
config.output = `${process.cwd()}/${config.output}`;

const builder = new Builder(config);

builder.build();
