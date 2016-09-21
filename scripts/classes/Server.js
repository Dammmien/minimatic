module.exports = class Server {

    constructor( options ) {
        this.express = require( 'express' );
        this.server = this.express();
        this.options = options;
        this.server.use( this.express.static( this.options.folder ) );
    }

    start() {
        this.server.listen(
            this.options.port,
            () => console.log( `Server listening on: http://localhost:${this.options.port}` )
        );
    }

}
