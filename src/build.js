const project = require('../project.js');
const Utils = require('./Utils');
const Page = require('./Page');
const fs = require('fs');

Utils.removeDirectory(project.output);
Utils.recursiveCopy(`${project.src}/assets`, `${project.output}/assets`);

for(const [collectionName, pages] of Object.entries(project.collections)) {
  const collection = require(`${project.src}/content/metadata/${collectionName}`);

  pages.forEach(data => {
    const page = new Page(collection, data);
    page.render();
  });
}

fs.mkdirSync(`${project.output}/assets/images/thumbnails`);
