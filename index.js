const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const marked = require('marked');

module.exports = class Minimatic {

  constructor(config) {
    this.config = config;
  }

  static recursiveCopy (src, dest) {
    fs.readdirSync(src, { withFileTypes: true }).forEach(file => {
      fs.mkdirSync(dest, { recursive: true });
      if (file.isDirectory()) Minimatic.recursiveCopy(`${src}/${file.name}`, `${dest}/${file.name}`);
      else fs.copyFileSync(`${src}/${file.name}`, `${dest}/${file.name}`);
    });
  }

  srcDir(filePath) {
    return `${process.cwd()}/${this.config.src}/${filePath}`;
  }

  importMap(map) {
    return Object.entries(map).reduce((out, [key, filePath]) => {
      if (fs.lstatSync(this.srcDir(filePath)).isDirectory()) {
        out[key] = this.importDirectory(filePath);
      } else {
        out[key] = this.importFile(filePath);
      }

      return out;
    }, {});
  }

  importMarkdown(markdown) {
    const regex = /(\{[^\)]+\})/gm;
    const fm = JSON.parse(markdown.match(regex)[0]);

    return { ...fm, body: marked(markdown.replace(regex, '')) };
  }

  importFile(file) {
    const filePath = this.srcDir(file);
    const content = fs.readFileSync(filePath, 'utf8');

    if (path.extname(filePath) === '.md') {
      return this.importMarkdown(content);
    } else if (path.extname(filePath) === '.json') {
      return JSON.parse(content);
    } else {
      return content;
    }
  }

  importDirectory(dir) {
    return fs.readdirSync(this.srcDir(dir)).map(file => this.importFile(`${dir}/${file}`));
  }

  renderPage(collection, page) {
    const data = { ...this.config, ...collection, ...page, ...this.importMap(page.import || {}) };
    const partials = this.importMap({ ...collection.partials, ...page.partials });
    const template = fs.readFileSync(`${this.config.src}/${collection.template}`, 'utf8');
    const output = `${this.config.output}/${page.output}`;

    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, mustache.render(template, data, partials));
  }

  async build(watchMode) {
    const start = Date.now();

    if (typeof this.config.preBuild === 'function') {
      await this.config.preBuild();
    }

    for (const collectionPath in this.config.collections) {
      this.importDirectory(collectionPath).forEach(page => {
        try {
          this.renderPage(this.config.collections[collectionPath], page);
        } catch (error) {
          console.log('\x1b[31m%s\x1b[0m', `Error during processing ${this.config.output}/${page.output}: ${error.message}\x1B[0m`);
        }
      });
    }

    if (typeof this.config.postBuild === 'function') {
      await this.config.postBuild();
    }

    console.log('\x1b[32m%s\x1b[0m', `Build successful in ${Date.now() - start}ms`);

    if (watchMode) {
      this.watch();
    }
  }

  watch() {
    fs.watch(this.config.src, { recursive: true }, (type, fileName) => {
      console.log('\x1b[36m%s\x1b[0m', `Changes detected in: ${this.srcDir(fileName)}`);
      this.build();
    });
  }

}
