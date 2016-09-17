var events = require( 'events' );

module.exports = class Server {

    constructor( options ) {
        this.http = require( 'http' );
        this.fs = require( 'fs' );
        this.eventEmitter = new events.EventEmitter();
        this._options = options;
        this._server = this.http.createServer( this.handleRequest.bind( this ) );
        this.sseClientString = "<script>var a = new EventSource('statik-reloader');a.addEventListener('reload',function(data){window.location.reload();});</script>";
    }

    sendFile( response, filePath ) {
        try {
            response.writeHead( 200 );
            let html = this.fs.readFileSync( `${filePath}`, 'utf8' );
            if ( filePath.includes( '.html' ) ) html = html.replace( '</body>', this.sseClientString + '</body>' );
            response.end( html );
        } catch ( e ) {
            response.writeHead( 404 );
            response.end( `Not found: ${filePath}` );
        }
    }

    handleRequest( request, response ) {
        if ( request.url === "/statik-reloader" ) {
            response.writeHead( 200, {
                "Content-Type": "text/event-stream",
                "Connection": "keep-alive"
            } );
            response.write( "retry: 10000\n" );
            var reload = function() {
                response.write( "event: " + 'reload\n' );
                response.write( "data: " + 'reload\n\n' );
            };
            this.eventEmitter.on( 'reload', reload );
            request.connection.addListener( "close", function() {
                this.eventEmitter.removeListener( 'reload', reload );
                response.end();
            }.bind( this ), false );
        } else if ( request.url === "/" ) {
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

    reload() {
        this.eventEmitter.emit( 'reload' );
    }

}
