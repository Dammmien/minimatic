let Server = require( './classes/Server' );

let server = new Server( {
    port: 9000,
    folder: "./www"
} );

server.start();
