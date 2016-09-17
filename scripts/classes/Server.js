module.exports = class Server {

    constructor( options ) {
        this.http = require( 'http' );
        this.fs = require( 'fs' );
        this._options = options;
        this._server = this.http.createServer( this.handleRequest.bind( this ) );
    }

    sendFile( response, filePath ) {
        try {
            response.writeHead( 200 );
            response.end( this.fs.readFileSync( `${filePath}` ) );
        } catch ( e ) {
            response.writeHead( 404 );
            response.end( `Not found: ${filePath}` );
        }
    }

    handleRequest( request, response ) {
        if ( request.url === "/" ) {
            this.sendFile( response, `${this._options.folder}/index.html` );
        } else {
            this.sendFile( response, `${this._options.folder}${request.url}` );
        }
        console.log( `${request.method} - ${request.url}` );
    }

    start() {
        this._server.listen(
            this._options.port,
            () => console.log( `Server listening on: http://localhost:${this._options.port}` )
        );
    }

}
