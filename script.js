const fs = require('fs');

const movies = JSON.parse(fs.readFileSync('./example/movies.json', 'utf8'));

function getOutputFileName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/gi, '-');
}

movies.forEach(movie => {
  const fileName = getOutputFileName(movie.title);
  const content = {
    data: movie,
    output: `movies/${fileName}.html`
  };
  fs.writeFileSync(`./example/src/collections/movies/${fileName}.json`, JSON.stringify(content, null, '  '));
});

console.log(movies.length);