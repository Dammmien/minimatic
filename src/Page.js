const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const project = require(`${process.cwd()}/config.js`);
const { importMap } = require('./Utils.js');

module.exports = class Page {

  constructor(collection, page) {
    this.data = { ...project, ...collection, ...page, ...importMap(page.import || {}) };
    this.partials =  importMap({ ...collection.partials, ...page.partials });
    this.template = fs.readFileSync(`${project.src}/${collection.template}`, 'utf8');
    this.output = `${project.output}/${page.output}`;
  }

  render() {
    try {
      fs.mkdirSync(path.dirname(this.output), { recursive: true });
      fs.writeFileSync(this.output, mustache.render(this.template, this.data, this.partials));
    } catch (error) {
      console.log(`\x1B[31mError during processing ${this.output} : ${error.message}\x1B[0m`);
    }
  }

}
