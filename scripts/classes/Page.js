module.exports = class Page {

    constructor( options ) {
        this.fs = require( 'fs' );
        this.markdownParser = require( 'marked' );
        this._options = options;
        this.setConfig();
    }

    setConfig() {
        try {
            this._config = JSON.parse( this.fs.readFileSync( this._options.jsonPath, 'utf8' ) );
        } catch ( e ) {
            console.log( `Impossible to parse ${this._options.jsonPath}` );
        }
    }

    get baseTemplate() {
        return this.fs.readFileSync( `${this._options.src}/templates/base.mustache`, 'utf8' );
    }

    get output() {
        return this._options.jsonPath.replace( `${this._options.src}/pages`, this._options.output ).replace( '.json', '.html' );
    }

    get partials() {
        let out = {};
        for ( var partialTemplate in this._config.partials ) {
            out[ partialTemplate ] = this.fs.readFileSync( `${this._options.src}/templates/${this._config.partials[ partialTemplate ]}`, 'utf8' );
        }
        return out;
    }

    get common() {
        return this._config.common.map( file => JSON.parse( this.fs.readFileSync( `${this._options.src}/common/${file}`, 'utf8' ) ) );
    }

    get collections() {
        let out = {};
        for ( var collection in this._config.collections ) {
            let directory = this._config.collections[ collection ];
            out[ collection ] = this.fs.readdirSync( `${this._options.src}/pages/${directory}` ).map(
                collectionItemFile => JSON.parse( this.fs.readFileSync( `${this._options.src}/pages/${directory}/${collectionItemFile}`, 'utf8' ) )
            );
        }
        return out;
    }

    get hasCollections() {
        return this._config.collections;
    }

    get data() {
        let jsonData = {
            meta: this._config.meta,
            assets: this._config.assets,
            collections: this.collections
        };

        let markdownData = {};

        for ( var key in this._config.markdown ) {
            let filePath = this._config.markdown[ key ],
                markdown = this.fs.readFileSync( `${this._options.src}/content/${filePath}`, 'utf8' );

            console.log( `${this._options.src}/content/${filePath}` );
            console.log( markdown );

            markdownData[ key ] = this.markdownParser( markdown );
        }

        return Object.assign( jsonData, markdownData, ...this.common, this._config.data );
    }

}
