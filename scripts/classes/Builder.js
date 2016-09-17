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

    recursiveCopy( source, target ) {
        fs.readdirSync( source ).forEach( filePath => {
            if ( fs.lstatSync( `${source}/${filePath}` ).isDirectory() ) {
                this.recursiveCopy( `${source}/${filePath}`, `${target}/${filePath}` )
            } else {
                this.ensureDirectoryExistence( `${target}/${filePath}` );
                fs.writeFileSync(
                    `${target}/${filePath}`,
                    fs.readFileSync( `${source}/${filePath}` )
                );
            }
        } );
    }

    buildPage( filePath ) {
        var page = new Page( {
            jsonPath: filePath,
            src: this._options.src,
            output: this._options.output
        } );

        this.ensureDirectoryExistence( page.output );

        fs.writeFileSync(
            page.output,
            mustache.render( page.baseTemplate, page.data, page.partials )
        );
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

}
