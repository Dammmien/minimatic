const Builder = require('./Builder');
const Utils = require('./Utils');
const config = require('../config.json');
const builder = new Builder();
const sharp = require('sharp');
const fs = require('fs');

config.postBuild = () => {
	const images = Utils.getFilesPath(`${config.output}/assets/images/uploads`);
	fs.mkdirSync(`${config.output}/assets/images/thumbnails`);
	images.forEach( image => sharp(image).resize(200).toFile(image.replace('uploads', 'thumbnails')) );
};

builder.build(config);
