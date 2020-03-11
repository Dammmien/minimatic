const { src, output } = require(`${process.cwd()}/package.json`).statik;
const { importDirectory, recursiveCopy } = require('./Utils.js');
const Page = require('./Page.js');
const fs = require('fs');

module.exports = () => {
  fs.rmdirSync(output, { recursive: true });

  recursiveCopy(`${src}/assets`, `${output}/assets`);

  importDirectory(`${src}/content/collections`).forEach((collection) => {
    importDirectory(collection.directory).forEach(item => {
      const page = new Page(collection, item);
      page.render();
    });
  });

  fs.mkdirSync(`${output}/assets/images/thumbnails`);
};
