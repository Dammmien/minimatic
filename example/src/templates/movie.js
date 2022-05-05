module.exports = (data, partials, utils) => `
  <div>
    <h1>${data.title}</h1>
    <p>${data.year}</p>
    <h2>Genres</h2>
    <ul>
      ${data.genres.map(partials.genre).join('\n')}
    </ul>
    <h2>Cast</h2>
    <ul>
      ${data.cast.map(partials.genre).join('\n')}
    </ul>
  </div>
`;