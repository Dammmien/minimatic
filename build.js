const Minimatic = require('./index.js');
const config = require('./example/config.js');

const mini = new Minimatic(config);

mini.build();