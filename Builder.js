const Page = require('./Page');
const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const markdownParser = require('marked');
const eol = require('os').EOL;

module.exports = class Builder {

    constructor(config) {
        this.config = config;
    }

    build() {
        const startCleaning = Date.now();
        this.cleanDestination(this.config.output);
        console.log(`Output folder cleaned in ${Date.now() - startCleaning} ms.`);

        const startBuild = Date.now();
        const pages = this.getPagesToBuild(`${this.config.src}/content`);
        pages.forEach(page => this.buildPage(page));
        console.log(`${pages.length} pages built in ${Date.now() - startBuild} ms.`);

        const startAssets = Date.now();
        this.recursiveCopy(`${this.config.src}/assets`, `${this.config.output}/assets`);
        console.log(`Assets folder copied in ${Date.now() - startAssets} ms.`);
    }

    ensureDirectoryExistence(filePath) {
        const dirname = path.dirname(filePath);
        if (fs.existsSync(dirname)) return true;
        this.ensureDirectoryExistence(dirname);
        fs.mkdirSync(dirname);
    }

    writeFile(destination, content) {
        this.ensureDirectoryExistence(destination);
        fs.writeFileSync(destination, content);
    }

    recursiveCopy(source, destination) {
        fs.readdirSync(source).forEach(file => {
            if (fs.lstatSync(`${source}/${file}`).isDirectory()) this.recursiveCopy(`${source}/${file}`, `${destination}/${file}`);
            else this.writeFile(`${destination}/${file}`, fs.readFileSync(`${source}/${file}`));
        });
    }

    buildPage(config) {
        const page = new Page(config, this);

        try {
            this.writeFile(page.output, mustache.render(page.template, page.data, page.partials));
        } catch (e) {
            console.log(`\x1B[31mError during processing ${config.output}\x1B[0m`);
        }
    }

    getMarkdownPageConfig(file) {
        const [header, markdown] = fs.readFileSync(file, 'utf8').split(`${eol}---${eol}`);
        const config = this.extendConfig(JSON.parse(header));
        config.data = config.data || {};
        config.data.markdown = markdownParser(markdown);
        return config;
    }

    extendConfig(config) {
        const extend = JSON.parse(fs.readFileSync(`${this.config.src}/${config.extend}`, 'utf8'));
        delete config.extend;
        for (const key in extend)
            if (typeof extend[key] === 'object' && !Array.isArray(extend[key]))
                config[key] = Object.assign(extend[key], config[key] || {});
        config = Object.assign(extend, config);
        return config.extend ? this.extendConfig(config) : config;
    }

    getPagesToBuild(directory) {
        let pages = [];
        fs.readdirSync(directory).forEach(file => {
            if (fs.lstatSync(`${directory}/${file}`).isDirectory()) {
                pages = pages.concat(this.getPagesToBuild(`${directory}/${file}`));
            } else if (path.extname(file) === '.json') {
                let config = JSON.parse(fs.readFileSync(`${directory}/${file}`, 'utf8'));
                if (config.extend) config = this.extendConfig(config);
                if (config.template) pages.push(config);
            } else if (path.extname(file) === '.md') {
                pages.push(this.getMarkdownPageConfig(`${directory}/${file}`));
            }
        });
        return pages;
    }

    cleanDestination(directory) {
        if (fs.existsSync(directory)) {
            fs.readdirSync(directory).forEach(file => {
                const isDirectory = fs.lstatSync(`${directory}/${file}`).isDirectory();
                if (isDirectory) this.cleanDestination(`${directory}/${file}`);
                else fs.unlinkSync(`${directory}/${file}`);
            });
            fs.rmdirSync(directory);
        }
    }

}
