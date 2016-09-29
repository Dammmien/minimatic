module.exports = class Page {

    constructor( config, builder ) {
        this.fs = require( 'fs' );
        this.path = require( 'path' );
        this.markdownParser = require( 'marked' );
        this.builder = builder;

        this.config = config;

        this.src = process.env.npm_package_config_src;
        this.output = `${process.env.npm_package_config_output}/${this.config.output}`;
    }

    get baseTemplate() {
        return this.fs.readFileSync( `${this.src}/templates/${this.config.template}`, 'utf8' );
    }

    get partials() {
        let out = {};
        for ( var key in this.config.partials ) {
            let content = this.fs.readFileSync( `${this.src}/${this.config.partials[ key ]}`, 'utf8' );
            if ( this.path.extname( this.config.partials[ key ] ) === '.md' ) content = this.markdownParser( content );
            out[ key ] = content;
        }
        return out;
    }

    importDirectory( directory ) {
        let pages = this.builder.getPagesToBuild( directory ),
            collection = [];

        pages.forEach( config => {
            let page = new Page( config, this.builder );
            config.data = page.data;
            collection.push( config );
        } );

        return collection;
    }

    import () {
        let out = {};
        for ( var key in this.config.import ) {
            let file = this.config.import[ key ];

            if ( this.fs.lstatSync( `${this.src}/${file}` ).isDirectory() ) {
                out[ key ] = this.importDirectory( `${this.src}/${file}` );
            } else {
                out[ key ] = JSON.parse( this.fs.readFileSync( `${this.src}/${file}`, 'utf8' ) );
            }
        }
        return out;
    }

    get data() {
        return Object.assign( {}, this.config.data, this.import() );
    }

}
