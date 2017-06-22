const Builder = require('../Builder');
const fs = require('fs');

const config = {
	"root": "/",
	"dir_img": "/assets/images/",
	"dir_styles": "/assets/styles/",
	"dir_scripts": "/assets/scripts/",
	"src": ""
};

config.src = config.src ? `${process.cwd()}/${config.src}` : process.cwd();
config.output = config.output ? `${process.cwd()}/${config.output}` : `${process.cwd()}/www`;

const builder = new Builder(config);

builder.build();
