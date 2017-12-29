const Builder = require('./Builder');
const glob = require('glob');
const config = require('../config.json');
const builder = new Builder();
const sharp = require('sharp');
const fs = require('fs');

builder.build(config);

fs.mkdirSync(`${config.output}/assets/images/thumbnails`);

glob.sync(`${config.output}/assets/images/uploads/*.jpg`).forEach(
	image => sharp(image).resize(400).toFile(image.replace('uploads', 'thumbnails'))
);
