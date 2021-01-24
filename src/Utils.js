const project = require(`${process.cwd()}/config.js`);
const fs = require('fs');
const path = require('path');
const marked = require('marked');
const regex = /(\{[^\)]+\})/gm;

const srcDir = (filePath) => `${process.cwd()}/${project.src}/${filePath}`;

const recursiveCopy = (source, destination) => {
  fs.readdirSync(source, { withFileTypes: true }).forEach(file => {
    fs.mkdirSync(destination, { recursive: true });
    if (file.isDirectory()) recursiveCopy(`${source}/${file.name}`, `${destination}/${file.name}`);
    else fs.copyFileSync(`${source}/${file.name}`, `${destination}/${file.name}`);
  });
};

const importMap = (map) => {
  return Object.entries(map).reduce((out, [key, filePath]) => {
    if (fs.lstatSync(srcDir(filePath)).isDirectory()) {
      out[key] = importDirectory(filePath);
    } else {
      out[key] = importFile(filePath);
    }

    return out;
  }, {});
};

const importMarkdown = (markdown) => {
  const fm = JSON.parse(markdown.match(regex)[0]);
  return { ...fm, body: marked(markdown.replace(regex, '')) };
};

const importFile = (file) => {
  const filePath = srcDir(file);

  if (path.extname(filePath) === '.md') {
    return importMarkdown(fs.readFileSync(filePath, 'utf8'));
  } else if (path.extname(filePath) === '.html') {
    return fs.readFileSync(filePath, 'utf8');
  } else {
    return require(filePath);
  }
};

const importDirectory = (dir) => {
  return fs.readdirSync(srcDir(dir)).map(file => importFile(`${dir}/${file}`));
};

module.exports = {
  importDirectory,
  recursiveCopy,
  importMap,
  importMarkdown
};
