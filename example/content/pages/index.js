const fs = require('fs');

module.exports = {
  output: "index.html",
  partials: {
    body: "templates/index.mustache"
  },
  data: {
    "recipes": fs.readdirSync(`./example/content/recipes`).map(file => require(`../recipes/${file}`)),
    "title": "Recettes simples et rapides"
  }
}
