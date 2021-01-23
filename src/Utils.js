const fs = require('fs');
const path = require('path');
const marked = require('marked');
const regex = /(\{[^\)]+\})/gm;

const recursiveCopy = (source, destination) => {
  fs.readdirSync(source, { withFileTypes: true }).forEach(file => {
    fs.mkdirSync(destination, { recursive: true });
    if (file.isDirectory()) recursiveCopy(`${source}/${file.name}`, `${destination}/${file.name}`);
    else fs.copyFileSync(`${source}/${file.name}`, `${destination}/${file.name}`);
  });
};

const parseMarkdown = markdown => {
  const fm = JSON.parse(markdown.match(regex)[0]);
  return { ...fm, body: marked(markdown.replace(regex, '')) };
};

const importDirectory = filePath => {
  const dir = `${process.cwd()}/${filePath}`;
  return fs.readdirSync(dir).map(file => {
    if (path.extname(file) === '.md') {
      return parseMarkdown(fs.readFileSync(`${dir}/${file}`, 'utf8'));
    } else {
      return require(`${dir}/${file}`);
    }
  });
};

module.exports = {
  importDirectory,
  recursiveCopy
};
