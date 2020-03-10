const fs = require('fs');
const path = require('path');
const Utils = require('./Utils');
const mustache = require('mustache');

module.exports = class Page {

  constructor(project, collection, page) {
    this.project = project;
    this.data = { ...project.data, ...collection.data, ...page.data };
    this.partials =  this.importPartials({ ...collection.partials, ...page.partials });
    this.template = fs.readFileSync(`${project.src}/${collection.template}`, 'utf8');
    this.output = `${project.output}/${page.output}`;
  }

  importPartials(obj) {
    const out = {};
    for (var key in obj) out[key] = fs.readFileSync(`${this.project.src}/${obj[ key ]}`, 'utf8');
    return out;
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
