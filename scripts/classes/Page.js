module.exports = class Page {

    constructor( file ) {
        this.fs = require( 'fs' );
        this.markdownParser = require( 'marked' );

        this.config = JSON.parse( this.fs.readFileSync( file, 'utf8' ) );

        this.src = process.env.npm_package_config_src;
        this.output = `${process.env.npm_package_config_output}/${this.config.output}`;
    }

    get baseTemplate() {
        return this.fs.readFileSync( `${this.src}/templates/base.mustache`, 'utf8' );
    }

    get partials() {
        let out = {};
        this.config.partials.forEach( partial => {
            var content = this.fs.readFileSync( `${this.src}/${partial.file}`, 'utf8' );
            if ( partial.type === "markdown" ) content = this.markdownParser( content );
            out[ partial.key ] = content;
        } );
        return out;
    }

    importJson() {
        let out = {};
        for ( var key in this.config.importJson ) {
            let file = this.config.importJson[ key ];
            out[ key ] = JSON.parse( this.fs.readFileSync( `${this.src}/${file}`, 'utf8' ) )
        }
        return out;
    }

    get data() {
        let jsonData = {
            meta: this.config.meta
        };

        return Object.assign( jsonData, this.config.data, this.importJson() );
    }

}
