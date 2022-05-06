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
    this.cache = new Map();
  }

  importMap(map) {
    return Object.entries(map).reduce((out, [key, filePath]) => {
      const isDirectory = fs.lstatSync(`${this.src}/${filePath}`).isDirectory();

      out[key] = isDirectory ? this.importDirectory(filePath) : this.importFile(filePath);

      return out;
    }, {});
  }

  parseMarkdown(markdown) {
    const regex = /(\{[^\)]+\})/gm;
    const fm = JSON.parse(markdown.match(regex)[0]);

    return { ...fm, body: marked(markdown.replace(regex, '')) };
  }

  parseFile(filePath, content) {
    if (path.extname(filePath) === '.md') {
      return this.parseMarkdown(content);
    } else if (path.extname(filePath) === '.json') {
      return JSON.parse(content);
    } else {
      return content;
    }
  }

  readOrRequire(filePath) {
    if (path.extname(filePath) === '.js') {
      return require(filePath);
    }

    return fs.readFileSync(filePath, 'utf8');
  }

  importFile(file) {
    const filePath = `${this.src}/${file}`;

    if (this.cache.has(filePath)) {
      return this.cache.get(filePath);
    }

    const content = this.readOrRequire(filePath);
    const parsedFile = this.parseFile(filePath, content);

    this.cache.set(filePath, parsedFile);

    return parsedFile;
  }

  importDirectory(dir) {
    return fs.readdirSync(`${this.src}/${dir}`).map(file => this.importFile(`${dir}/${file}`));
  }

  async renderPage(collection, page) {
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

    const template = this.importFile(collection.template);

    fs.mkdirSync(path.dirname(`${this.output}/${page.output}`), { recursive: true });

    fs.writeFileSync(`${this.output}/${page.output}`, mustache.render(template, data, partials));

    if (typeof this.config.onPageRendered === 'function') {
      await this.config.onPageRendered(data);
    }
  }

  renderCollectionsPages() {
    for (const collectionPath in this.config.collections) {
      this.importDirectory(collectionPath).forEach(page => {
        try {
          this.renderPage(this.config.collections[collectionPath], page);
        } catch (error) {
          console.log('\x1b[31m%s\x1b[0m', `Error during processing ${this.output}/${page.output}: ${error.message}`);
        }
      });
    }
  }

  async build(watch, serve) {
    const start = Date.now();

    if (typeof this.config.preBuild === 'function') {
      await this.config.preBuild();
    }

    this.renderCollectionsPages();

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

  clearFileCache(filePath) {
    this.cache.delete(filePath);

    if (path.extname(filePath) === '.js') {
      delete require.cache[filePath];
    }
  }

  watch() {
    fs.watch(this.config.src, { recursive: true }, (type, file) => {
      const filePath = `${this.src}/${file}`;

      console.log('\x1b[36m%s\x1b[0m', `Changes detected in: ${filePath}`);

      this.clearFileCache(filePath);

      this.build();
    });
  }

}
