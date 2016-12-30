let Server = require( './classes/Server' );

let server = new Server( {
    port: 9000,
    folder: `./${process.env.npm_package_config_output}`
} );

server.start();
