const src = process.env.npm_package_config_src;
const output = process.env.npm_package_config_output;

let Builder = require( './classes/Builder' ),
    builder = new Builder( {
        src: src,
        output: output,
    } );

let Server = require( './classes/Server' ),
    server = new Server( {
        port: 3000,
        folder: output
    } );

let watch = require( 'watch' );

watch.watchTree( src, {
    interval: 1
}, ( f, curr, prev ) => {
    if ( typeof f == "object" && prev === null && curr === null ) {
        console.log( "Watching ..." );
    } else {
        console.log( "Something changed" );
        builder.build();
    }
} );

server.start();
