const fs = require('fs');

const recursiveCopy = (source, destination) => {
  fs.readdirSync(source, { withFileTypes: true }).forEach(file => {
    fs.mkdirSync(destination, { recursive: true });
    if (file.isDirectory()) recursiveCopy(`${source}/${file.name}`, `${destination}/${file.name}`);
    else fs.copyFileSync(`${source}/${file.name}`, `${destination}/${file.name}`);
  });
};

const importDirectory = path => {
  const dir = `${process.cwd()}/${path}`;
  return fs.readdirSync(dir).map(file => require(`${dir}/${file}`));
};

module.exports = {
  importDirectory,
  recursiveCopy
};
