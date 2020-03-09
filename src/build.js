const project = require('../project.json');
const Utils = require('./Utils');
const Page = require('./Page');
const fs = require('fs');

Utils.removeDirectory(project.output);
Utils.recursiveCopy(`${project.src}/assets`, `${project.output}/assets`);

for (const pathSchema in project.paths) {
  const metadata = Utils.readAndParse(`${project.src}/${project.paths[pathSchema]}`);

  if (fs.lstatSync(`${project.src}/${pathSchema}`).isDirectory()) {
    fs.readdirSync(`${project.src}/${pathSchema}`).forEach(
      file => new Page(metadata, `${project.src}/${pathSchema}/${file}`).render()
    );
  } else {
    new Page(metadata, `${project.src}/${pathSchema}`).render()
  }
}

fs.mkdirSync(`${project.output}/assets/images/thumbnails`);
