const fs = require('fs');
const path = require('path');

const removeDirectory = directory => {
  if (fs.existsSync(directory)) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach(file => {
      if (file.isDirectory()) removeDirectory(`${directory}/${file.name}`);
      else fs.unlinkSync(`${directory}/${file.name}`);
    });
    fs.rmdirSync(directory);
  }
};

const writeFile = (destination, content) => {
  path.dirname(destination).split('/').reduce((out, dir) => {
    if (!fs.existsSync(`${out}/${dir}`)) fs.mkdirSync(`${out}/${dir}`);
    return `${out}/${dir}`;
  }, '.');
  fs.writeFileSync(destination, content);
};

const recursiveCopy = (source, destination) => {
  fs.readdirSync(source, { withFileTypes: true }).forEach(file => {
    if (file.isDirectory()) recursiveCopy(`${source}/${file.name}`, `${destination}/${file.name}`);
    else writeFile(`${destination}/${file.name}`, fs.readFileSync(`${source}/${file.name}`));
  });
};

const merge = (a, b) => {
  const out = Object.assign({}, a);

  for (const key in b) {
    if (out[key]) {
      if (Array.isArray(out[key])) out[key] = [...out[key], ...b[key]];
      else if (typeof out[key] === 'object') out[key] = merge(out[key], b[key]);
      else out[key] = b[key];
    } else {
      out[key] = b[key];
    }
  }

  return out;
};

const importDirectory = dir => {
  return fs.readdirSync(dir).map(file => this.getData({}, `${dir}/${file}`, true));
};

module.exports = {
  removeDirectory,
  writeFile,
  recursiveCopy,
  merge
};
