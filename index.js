const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const marked = require('marked');
const Server = require('dev-file-server');

module.exports = class Minimatic {

  constructor(config) {
    this.config = config;
    this.src = `${process.cwd()}/${this.config.src}`;
    this.output = `${process.cwd()}/${this.config.output}`;
  }

  static recursiveCopy (src, dest) {
    fs.readdirSync(src, { withFileTypes: true }).forEach(file => {
      fs.mkdirSync(dest, { recursive: true });
      if (file.isDirectory()) Minimatic.recursiveCopy(`${src}/${file.name}`, `${dest}/${file.name}`);
      else fs.copyFileSync(`${src}/${file.name}`, `${dest}/${file.name}`);
    });
  }

  importMap(map) {
    return Object.entries(map).reduce((out, [key, filePath]) => {
      if (fs.lstatSync(`${this.src}/${filePath}`).isDirectory()) {
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
    const filePath = `${this.src}/${file}`;
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
    return fs.readdirSync(`${this.src}/${dir}`).map(file => this.importFile(`${dir}/${file}`));
  }

  renderPage(collection, page) {
    const data = {
      ...this.importMap(this.config.imports || {}),
      ...this.config,
      ...this.importMap(collection.imports || {}),
      ...collection,
      ...this.importMap(page.imports || {}),
      ...page
    };

    const partials = this.importMap({
      ...(this.config.partials || {}),
      ...(collection.partials || {}),
      ...(page.partials || {})
    });

    const template = fs.readFileSync(`${this.config.src}/${collection.template}`, 'utf8');

    fs.mkdirSync(path.dirname(`${this.output}/${page.output}`), { recursive: true });
    fs.writeFileSync(`${this.output}/${page.output}`, mustache.render(template, data, partials));
  }

  async build(watch, serve) {
    const start = Date.now();

    if (typeof this.config.preBuild === 'function') {
      await this.config.preBuild();
    }

    for (const collectionPath in this.config.collections) {
      this.importDirectory(collectionPath).forEach(page => {
        try {
          this.renderPage(this.config.collections[collectionPath], page);
        } catch (error) {
          console.log('\x1b[31m%s\x1b[0m', `Error during processing ${this.output}/${page.output}: ${error.message}`);
        }
      });
    }

    if (typeof this.config.postBuild === 'function') {
      await this.config.postBuild();
    }

    console.log('\x1b[32m%s\x1b[0m', `Build successful in ${Date.now() - start}ms`);

    if (watch) {
      this.watch();
    }

    if (serve) {
      const server = new Server(this.output);
      server.listen();
    }
  }

  watch() {
    fs.watch(this.config.src, { recursive: true }, (type, fileName) => {
      console.log('\x1b[36m%s\x1b[0m', `Changes detected in: ${this.src}/${fileName}`);
      this.build();
    });
  }

}
