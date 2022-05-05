module.exports = {
  src: 'example/src',
  output: 'example/www',
  collections: [{
    folder: 'collections/movies',
    template: 'movie.js',
    partials: {
      genre: 'partials/genre.js'
    },
    imports: {
      pokemons: 'imports/pokemons.json'
    }
  }]
};