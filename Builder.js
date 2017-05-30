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
        let startCleaning = Date.now();
        this.cleanDestination(this.config.output);
        let endCleaning = Date.now() - startCleaning;
        console.log(`Output folder cleaned in ${Date.now() - startCleaning} ms.`);

        let startBuild = Date.now();
        let pages = this.getPagesToBuild(`${this.config.src}/content`);
        pages.forEach(page => this.buildPage(page));
        let endBuild = Date.now() - startBuild;
        console.log(`${pages.length} pages built in ${endBuild} ms.`);

        let startAssets = Date.now();
        this.recursiveCopy(`${this.config.src}/assets`, `${this.config.output}/assets`);
        let endAssets = Date.now() - startAssets;
        console.log(`Assets folder copied in ${endAssets} ms.`);
    }

    ensureDirectoryExistence(filePath) {
        let dirname = path.dirname(filePath);
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
            if (fs.lstatSync(`${source}/${file}`).isDirectory()) {
                this.recursiveCopy(`${source}/${file}`, `${destination}/${file}`)
            } else {
                this.writeFile(`${destination}/${file}`, fs.readFileSync(`${source}/${file}`));
            }
        });
    }

    buildPage(config) {
        config.data.project_config = this.project_config;
        var page = new Page(config, this);

        try {
            this.writeFile(page.output, mustache.render(page.template, page.data, page.partials));
        } catch (e) {
            console.log(`\x1B[31mError during processing ${config.output}\x1B[0m`);
        }
    }

    getMarkdownPageConfig(file) {
        let [header, content] = fs.readFileSync(file, 'utf8').split(`${eol}---${eol}`);

        header = JSON.parse(header);

        let config = JSON.parse(fs.readFileSync(`${this.config.src}/${header.metadata}`, 'utf8'));
        config.output = header.output;
        config.data.content = markdownParser(content);

        return config;
    }

    getPagesToBuild(directory) {
        let pages = [];
        fs.readdirSync(directory).forEach(file => {
            if (fs.lstatSync(`${directory}/${file}`).isDirectory()) {
                pages = pages.concat(this.getPagesToBuild(`${directory}/${file}`));
            } else if (path.extname(file) === '.json') {
                let config = JSON.parse(fs.readFileSync(`${directory}/${file}`, 'utf8'));
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
                let isDirectory = fs.lstatSync(`${directory}/${file}`).isDirectory();
                if (isDirectory) this.cleanDestination(`${directory}/${file}`);
                else fs.unlinkSync(`${directory}/${file}`);
            });
            fs.rmdirSync(directory);
        }
    }

}
