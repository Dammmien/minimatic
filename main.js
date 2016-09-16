const fs = require( 'fs' ),
    Page = require( './Page' ),
    path = require( 'path' ),
    mustache = require( 'mustache' );

const ensureDirectoryExistence = filePath => {
    let dirname = path.dirname( filePath );
    if ( fs.existsSync( dirname ) ) return true;
    ensureDirectoryExistence( dirname );
    fs.mkdirSync( dirname );
}

const recursiveCopy = ( directory, target ) => {
    fs.readdirSync( directory ).forEach( filePath => {
        if ( fs.lstatSync( `${directory}/${filePath}` ).isDirectory() ) {
            recursiveCopy( `${directory}/${filePath}`, `${target}/${filePath}` )
        } else {
            ensureDirectoryExistence( `${target}/${filePath}` );
            fs.writeFileSync(
                `${target}/${filePath}`,
                fs.readFileSync( `${directory}/${filePath}` )
            );
        }
    } );
}

const buildPage = pageFile => {
    var page = new Page( pageFile ),
        baseTemplate = fs.readFileSync( "./src/templates/base.mustache", 'utf8' );

    ensureDirectoryExistence( page.output );

    fs.writeFileSync(
        page.output,
        mustache.render( baseTemplate, page.data, page.partials )
    );
}

const buildFolder = folder => {
    fs.readdirSync( folder ).forEach( pageFile => {
        if ( fs.lstatSync( `${folder}/${pageFile}` ).isDirectory() ) {
            buildFolder( `${folder}/${pageFile}` )
        } else {
            buildPage( `${folder}/${pageFile}` );
        }
    } );
}

buildFolder( './src/pages' );

recursiveCopy( './src/assets', './www/assets' );
