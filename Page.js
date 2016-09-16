const fs = require( 'fs' ),
    Page = require( './Page' ),
    path = require( 'path' ),
    mustache = require( 'mustache' );

module.exports = class Page {

    constructor( filePath ) {
        this._jsonPath = filePath;
        this._config = JSON.parse( fs.readFileSync( this._jsonPath, 'utf8' ) );
    }

    get output() {
        return this._jsonPath.replace( 'src/pages', 'www' ).replace( '.json', '.html' );
    }

    get partials() {
        let out = {};
        for ( var partialTemplate in this._config.partials ) {
            out[ partialTemplate ] = fs.readFileSync( `./src/templates/${this._config.partials[ partialTemplate ]}`, 'utf8' );
        }
        return out;
    }

    get common() {
        return this._config.common.map( file => JSON.parse( fs.readFileSync( `./src/common/${file}`, 'utf8' ) ) );
    }

    get collections() {
        let out = {};
        for ( var collection in this._config.collections ) {
            let directory = this._config.collections[ collection ];
            out[ collection ] = fs.readdirSync( `./src/pages/${directory}` ).map(
                collectionItemFile => JSON.parse( fs.readFileSync( `./src/pages/${directory}/${collectionItemFile}`, 'utf8' ) )
            );
        }
        return out;
    }

    get hasCollections() {
        return this._config.collections;
    }

    get data() {
        return Object.assign( {
            meta: this._config.meta,
            assets: this._config.assets,
            collections: this.collections
        }, ...this.common, this._config.data );
    }


}
