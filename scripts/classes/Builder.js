const Page = require( './Page' );

module.exports = class Builder {

    constructor( options ) {
        this.fs = require( 'fs' );
        this.path = require( 'path' );
        this.mustache = require( 'mustache' );

        this.src = process.env.npm_package_config_src;
        this._output = process.env.npm_package_config_output;
    }

    build() {
        let start = Date.now();
        process.stdout.write( "Building ... " );

        this.cleanDestination( this._output );
        let pages = this.getPagesToBuild( `${this.src}/content` );
        pages.forEach( page => {
            if ( page.template ) this.buildPage( page );
        } );
        this.recursiveCopy( `${this.src}/assets`, `${this._output}/assets` );

        let end = Date.now() - start;
        process.stdout.write( `${end} ms.\n` );
    }

    ensureDirectoryExistence( filePath ) {
        let dirname = this.path.dirname( filePath );
        if ( this.fs.existsSync( dirname ) ) return true;
        this.ensureDirectoryExistence( dirname );
        this.fs.mkdirSync( dirname );
    }

    writeFile( destination, content ) {
        this.ensureDirectoryExistence( destination );
        this.fs.writeFileSync( destination, content );
    }

    recursiveCopy( source, destination ) {
        this.fs.readdirSync( source ).forEach( file => {
            if ( this.fs.lstatSync( `${source}/${file}` ).isDirectory() ) {
                this.recursiveCopy( `${source}/${file}`, `${destination}/${file}` )
            } else {
                this.writeFile( `${destination}/${file}`, this.fs.readFileSync( `${source}/${file}` ) );
            }
        } );
    }

    buildPage( config ) {
        var page = new Page( config, this );

        try {
            this.writeFile( page.output, this.mustache.render( page.baseTemplate, page.data, page.partials ) );
        } catch ( e ) {
            console.log( `\x1B[31mError during processing ${config.output}\x1B[0m` );
        }
    }

    getPagesToBuild( directory ) {
        let pages = [];
        this.fs.readdirSync( directory ).forEach( file => {
            if ( this.fs.lstatSync( `${directory}/${file}` ).isDirectory() ) {
                pages = pages.concat( this.getPagesToBuild( `${directory}/${file}` ) );
            } else if ( this.path.extname( file ) === '.json' ) {
                let config = JSON.parse( this.fs.readFileSync( `${directory}/${file}`, 'utf8' ) );
                pages.push( config );
            }
        } );
        return pages;
    }

    cleanDestination( directory ) {
        if ( this.fs.existsSync( directory ) ) {
            this.fs.readdirSync( directory ).forEach( file => {
                let isDirectory = this.fs.lstatSync( `${directory}/${file}` ).isDirectory();
                if ( isDirectory ) this.cleanDestination( `${directory}/${file}` );
                else this.fs.unlinkSync( `${directory}/${file}` );
            } );
            this.fs.rmdirSync( directory );
        }
    }

}
