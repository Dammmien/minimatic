let Builder = require( './classes/Builder' ),
    builder = new Builder( {
        src: process.env.npm_package_config_src,
        output: process.env.npm_package_config_output,
    } );

builder.buildPages();
builder.copyAssets();
