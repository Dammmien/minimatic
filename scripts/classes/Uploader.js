module.exports = class Uploader {

    constructor( options ) {
        this._options = options;
        this.fs = require( 'fs' );
        this.https = require( 'https' );
    }

    initRequest() {
        this._request = this.https.request( this._options, ( res ) => {
            let out = "";
            res.on( 'data', d => out += d );
            res.on( 'end', () => console.log( out ) );
        } );
    }

    initReadStream( filePath ) {
        this._readStream = this.fs.createReadStream( './www.zip' );
        this._readStream.on( 'data', chunk => this._request.write( chunk ) );
        this._readStream.on( 'end', chunk => this._request.end() );
    }

    upload( filePath ) {
        this.initRequest();
        this.initReadStream( filePath );
    }
}
