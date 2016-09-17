module.exports = class Page {

    constructor( options ) {
        this.fs = require( 'fs' );
        this._options = options;
        this._config = JSON.parse( this.fs.readFileSync( this._options.jsonPath, 'utf8' ) );
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
        let data = {
            meta: this._config.meta,
            assets: this._config.assets,
            collections: this.collections
        };

        return Object.assign( data, ...this.common, this._config.data );
    }

}
