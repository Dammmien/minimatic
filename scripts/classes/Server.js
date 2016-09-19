var events = require( 'events' );

module.exports = class Server {

    constructor( options ) {
        this.express = require( 'express' );
        this._server = this.express();
        this._options = options;
        this._server.use( this.express.static( this._options.folder ) );
    }


    start() {
        this._server.listen(
            this._options.port,
            () => console.log( `Server listening on: http://localhost:${this._options.port}` )
        );
    }

}
