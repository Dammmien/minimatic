const fs = require( 'fs' ),
    Page = require( './Page' ),
    path = require( 'path' ),
    mustache = require( 'mustache' );

module.exports = class Builder {

    constructor( options ) {
        this._options = options;
    }

    ensureDirectoryExistence( filePath ) {
        let dirname = path.dirname( filePath );
        if ( fs.existsSync( dirname ) ) return true;
        this.ensureDirectoryExistence( dirname );
        fs.mkdirSync( dirname );
    }

    copyFile( source, destination ) {
        this.ensureDirectoryExistence( destination );
        fs.writeFileSync(
            destination,
            fs.readFileSync( source )
        );
    }

    recursiveCopy( source, destination ) {
        fs.readdirSync( source ).forEach( filePath => {
            if ( fs.lstatSync( `${source}/${filePath}` ).isDirectory() ) {
                this.recursiveCopy( `${source}/${filePath}`, `${destination}/${filePath}` )
            } else {
                this.copyFile( `${source}/${filePath}`, `${destination}/${filePath}` );
            }
        } );
    }

    buildPage( filePath ) {
        var page = new Page( {
            jsonPath: filePath,
            src: this._options.src,
            output: this._options.output
        } );

        try {
            this.ensureDirectoryExistence( page.output );

            fs.writeFileSync(
                page.output,
                mustache.render( page.baseTemplate, page.data, page.partials )
            );
        } catch ( e ) {
            console.log( `\x1B[31mError during processing ${filePath}\x1B[0m` );
        }
    }

    buildPages( folder = `${this._options.src}/pages` ) {
        fs.readdirSync( folder ).forEach( pageFile => {
            if ( fs.lstatSync( `${folder}/${pageFile}` ).isDirectory() ) {
                this.buildPages( `${folder}/${pageFile}` )
            } else {
                this.buildPage( `${folder}/${pageFile}` );
            }
        } );
    }

    copyAssets() {
        this.recursiveCopy(
            `${this._options.src}/assets`,
            `${this._options.output}/assets`
        );
    }

    removeFile( path ) {
        console.log( path );
        fs.access( path, ( err ) => {
            if ( !err ) fs.unlinkSync( path );
        } );
    }

}
