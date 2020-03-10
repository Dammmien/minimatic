const fs = require('fs');

module.exports = {
  "data": {
    "dir_img": "/assets/images/",
    "dir_styles": "/assets/styles/",
    "dir_scripts": "/assets/scripts/"
  },
  "src": `${__dirname}/example`,
  "output": "www",
  "collections": {
    "pages": [
      require(`./example/content/pages/index.js`)
    ],
    "recipes": fs.readdirSync(`./example/content/recipes`).map(path => require(`./example/content/recipes/${path}`))
  }
};
