const { src, output, collections } = require(`${process.cwd()}/config.js`);
const { importDirectory, recursiveCopy } = require('./Utils.js');
const Page = require('./Page.js');
const fs = require('fs');

module.exports = () => {
  fs.rmdirSync(output, { recursive: true });

  if (fs.existsSync(`${src}/assets`)) {
    recursiveCopy(`${src}/assets`, `${output}/assets`);
  }

  if (fs.existsSync(`${src}/admin`)) {
    recursiveCopy(`${src}/admin`, `${output}/admin`);
  }

  for (const collectionPath in collections) {
    importDirectory(collectionPath).forEach(item => {
      const page = new Page(collections[collectionPath], item);
      page.render();
    });
  }

};
