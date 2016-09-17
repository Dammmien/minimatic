let Server = require( './classes/Server' );

let server = new Server( {
    port: 3000,
    folder: "./www"
} );

server.start();
