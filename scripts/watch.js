let Builder = require( './classes/Builder' ),
    Server = require( './classes/Server' ),
    watch = require( 'watch' ),
    src = process.env.npm_package_config_src,
    output = process.env.npm_package_config_output,
    builder = new Builder( {
        src: src,
        output: output
    } );

let server = new Server( {
    port: 3000,
    folder: "./www"
} );

server.start();

watch.watchTree( `${src}/pages`, ( f, curr, prev ) => {
    server.reload();
    if ( typeof f == "object" && prev === null && curr === null ) {

    } else if ( prev === null ) {
        console.log( `File added : ./${f}` );
        console.log( `Start processing ./${f}` );
        builder.buildPage( `./${f}` );
        console.log( `End processing ./${f}` );
    } else if ( curr.nlink === 0 ) {
        console.log( `File removed : ./${f}` );
        console.log( `Start cleaning output ./${f}` );
        builder.removeFile( `./${f}`.replace( `${src}/pages`, output ).replace( '.json', '.html' ) );
        console.log( `End cleaning output ./${f}` );
    } else {
        console.log( `File changed : ./${f}` );
        console.log( `Start processing ./${f}` );
        builder.buildPage( `./${f}` );
        console.log( `End processing ./${f}` );
    }
} );

watch.watchTree( `${src}/assets`, ( f, curr, prev ) => {
    if ( typeof f == "object" && prev === null && curr === null ) {

    } else if ( prev === null ) {
        console.log( `File added : ./${f}` );
        console.log( `Start copying file ./${f}` );
        builder.copyFile( `./${f}`, `./${f}`.replace( src, output ) );
        console.log( `End copying file ./${f}` );
    } else if ( curr.nlink === 0 ) {
        console.log( `File removed : ./${f}` );
        console.log( `Start cleaning output ./${f}` );
        builder.removeFile( `./${f}`.replace( src, output ) );
        console.log( `End cleaning output ./${f}` );
    } else {
        console.log( `File changed : ./${f}` );
        console.log( `Start update file ./${f}` );
        builder.copyFile( `./${f}`, `./${f}`.replace( src, output ) );
        console.log( `End update file ./${f}` );
    }
} );
