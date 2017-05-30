const Builder = require('./Builder');

const reduceConfig = (config, npm_package_config_property) => {
	const property = npm_package_config_property.replace('npm_package_config_', '');
	config[property] = process.env[npm_package_config_property];
	return config;
};

const config = Object.keys(process.env).filter(
	x => x.startsWith('npm_package_config_')
).reduce(
	reduceConfig, {}
);

const builder = new Builder(config);

builder.build();
