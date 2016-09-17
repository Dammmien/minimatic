let Uploader = require( './classes/Uploader' ),
    EasyZip = require( 'easy-zip' ).EasyZip;

let uploader = new Uploader( {
    hostname: 'api.netlify.com',
    path: '/api/v1/sites/e4508e13-6dbd-4a9d-844d-130c3a5bda28/deploys',
    method: "POST",
    headers: {
        "Authorization": "Bearer 8bee8d7ad991d44b67196835ef0edc1e48bc0239636eb26c0fa3949305666122",
        'Content-Type': 'application/zip'
    }
} );

let zipper = new EasyZip();

zipper.zipFolder(
    './www',
    () => zipper.writeToFile(
        './www.zip',
        () => uploader.upload( './www.zip' )
    )
);
