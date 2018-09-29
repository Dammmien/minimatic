const fs = require('fs');
const Utils = require('./Utils');
const mustache = require('mustache');
const project = require('../project.json');

module.exports = class Page {

  constructor(metadata, filePath) {
    this.data = this.getData(metadata, filePath, false);
    this.template = fs.readFileSync(`${project.src}/${this.data._template}`, 'utf8');
    this.output = `${project.output}/${this.data._output}`;
  }

  getPartials() {
    const out = {};
    for (var key in this.data._partials) out[key] = fs.readFileSync(`${project.src}/${this.data._partials[ key ]}`, 'utf8');
    return out;
  }

  imports(path, imports) {
    const out = {};

    for (const key in imports) {
      if (fs.lstatSync(`${path}/${imports[key]}`).isDirectory()) {
        out[key] = fs.readdirSync(`${path}/${imports[key]}`).map(
          filePath => this.getData({}, `${path}/${imports[key]}/${filePath}`, true)
        );
      } else {
        out[key] = Utils.readAndParse(`${path}/${imports[key]}`);
      }
    }

    return out;
  }

  getData(metadata, filePath, disableImports = false) {
    const page = Utils.readAndParse(filePath);
    return [
      project.data,
      disableImports ? {} : this.imports(project.src, metadata._imports || {}),
      metadata,
      disableImports ? {} : this.imports(project.src, page._imports || {}),
      page
    ].reduce((out, conf) => Utils.merge(out, conf), {});
  }

  render() {
    try {
      Utils.writeFile(this.output, mustache.render(this.template, this.data, this.getPartials()));
    } catch (error) {
      console.log(`\x1B[31mError during processing ${this.output} : ${error.message}\x1B[0m`);
    }
  }

}
