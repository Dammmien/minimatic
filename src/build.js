const { importDirectory, recursiveCopy } = require('./Utils.js');
const Page = require('./Page.js');
const fs = require('fs');

module.exports = (project) => {
  fs.rmdirSync(project.output, { recursive: true });

  recursiveCopy(`${project.src}/assets`, `${project.output}/assets`);

  for(const [collectionName, pagesPath] of Object.entries(project.collections)) {
    const pages = importDirectory(pagesPath);
    const collection = require(`${process.cwd()}/${project.src}/${collectionName}`);

    pages.forEach(data => {
      const page = new Page(project, collection, data);
      page.render();
    });
  }

  fs.mkdirSync(`${project.output}/assets/images/thumbnails`);
};
