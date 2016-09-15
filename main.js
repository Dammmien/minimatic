const fs = require( 'fs' ),
    mustache = require( 'mustache' );


fs.readdirSync( './src/pages' ).forEach( pageFile => {
    let page = JSON.parse( fs.readFileSync( `./src/pages/${pageFile}`, 'utf8' ) ),
        base = fs.readFileSync( "./src/templates/base.mustache", 'utf8' );

    for ( var partial in page.partials ) {
        page.partials[ partial ] = fs.readFileSync( `./src/templates/${page.partials[ partial ]}`, 'utf8' );
    }

    page.data = page.data.map( file => JSON.parse( fs.readFileSync( `./src/data/${file}`, 'utf8' ) ) );

    page.data = Object.assign( {}, ...page.data, page.assets, page.meta );

    fs.writeFileSync(
        `./www/${page.output}`,
        mustache.render( base, page.data, page.partials )
    );

} );
