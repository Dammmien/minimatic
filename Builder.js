const Page = require('./Page');
const Utils = require('./Utils');
const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const markdownParser = require('marked');
const minimatch = require("minimatch");

module.exports = class Builder {

    constructor(config) {
        this.config = config;
        this.utils = new Utils();
    }

    build() {
        const startCleaning = Date.now();
        this.utils.removeDirectory(this.config.output);
        console.log(`Output folder cleaned in ${Date.now() - startCleaning} ms.`);

        const startBuild = Date.now();
        const filesPath = this.getFilesPath(`${this.config.src}/content`);
        const pagesToBuild = this.getPagesToBuild(filesPath);
        pagesToBuild.forEach(pageToBuild => this.buildPage(pageToBuild));
        console.log(`${pagesToBuild.length} pages built in ${Date.now() - startBuild} ms.`);

        const startAssets = Date.now();
        this.utils.recursiveCopy(`${this.config.src}/assets`, `${this.config.output}/assets`);
        console.log(`Assets folder copied in ${Date.now() - startAssets} ms.`);
    }

    buildPage(config) {
        const page = new Page(config, this);

        try {
            this.utils.writeFile(page.output, mustache.render(page.template, page.data, page.partials));
        } catch (e) {
            console.log(`\x1B[31mError during processing ${config.output}\x1B[0m`);
        }
    }

    getMarkdownPageConfig(file) {
        try {
            const markdownFileContent = fs.readFileSync(file, 'utf8');
            const output = markdownFileContent.match(/<!--(.*)-->/)[1].trim();
            return {
                output: output,
                data: {
                    markdown: markdownParser(markdownFileContent)
                }
            };
        } catch (e) {
            console.log(`\x1B[31mInvalid markdown header in ${file}\x1B[0m`);
            return {};
        }
    }

    merge(destination, source) {
        for (const key in destination)
            if (typeof destination[key] === 'object' && !Array.isArray(destination[key]))
                source[key] = Object.assign(destination[key], source[key] || {});
        return Object.assign(destination, source);
    }

    extendConfig(config) {
        const extend = this.utils.readAndParse(`${this.config.src}/${config.extend}`);
        delete config.extend;
        config = this.merge(extend, config);
        return config.extend ? this.extendConfig(config) : config;
    }

    getPagesToBuild(filePaths) {
        const out = [];

        for (const pathSchema in this.config.paths) {
            const baseConf = this.utils.readAndParse(`${this.config.src}/${this.config.paths[pathSchema]}`);

            filePaths.forEach(filePath => {
                if (minimatch(filePath, `${this.config.src}/${pathSchema}`)) {
                    if (path.extname(filePath) === '.json' || path.extname(filePath) === '.yml') {
                        let pageConf = this.utils.readAndParse(filePath);
                        pageConf = this.merge(baseConf, pageConf);
                        out.push(pageConf.extend ? this.extendConfig(pageConf) : pageConf);
                    } else if (path.extname(filePath) === '.md') {
                        out.push(this.merge(baseConf, this.getMarkdownPageConfig(filePath)));
                    }
                }
            });
        }

        return out;
    }

    getFilesPath(directory) {
        let pages = [];
        fs.readdirSync(directory).forEach(file => {
            if (this.utils.isDirectory(`${directory}/${file}`)) pages = pages.concat(this.getFilesPath(`${directory}/${file}`));
            else pages.push(`${directory}/${file}`);
        });
        return pages;
    }

}
