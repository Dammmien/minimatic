const fs = require( 'fs' ),
    mustache = require( 'mustache' );


fs.readdirSync( './src/pages' ).forEach( pageFile => {
    var page = JSON.parse( fs.readFileSync( `./src/pages/${pageFile}`, 'utf8' ) ),
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


fs.readdirSync( './src/collections' ).forEach( collectionFile => {
    var collection = JSON.parse( fs.readFileSync( `./src/collections/${collectionFile}`, 'utf8' ) ),
        base = fs.readFileSync( "./src/templates/base.mustache", 'utf8' );

    for ( var partial in collection.partials ) {
        collection.partials[ partial ] = fs.readFileSync( `./src/templates/${collection.partials[ partial ]}`, 'utf8' );
    }

    fs.readdirSync( `./src/data/${collection.folder}` ).forEach( collectionItemFile => {
        var collectionItem = JSON.parse( fs.readFileSync( `./src/data/${collection.folder}/${collectionItemFile}`, 'utf8' ) );

        collectionItem.data = Object.assign( {}, collectionItem.data, collectionItem.meta );

        fs.writeFileSync(
            `./www/${collectionItem.output}`,
            mustache.render( base, collectionItem.data, collection.partials )
        );

    } );

} );
