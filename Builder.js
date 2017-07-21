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

    getMergedConf(baseConf, pageConf) {
        const mergedList = ['_imports', '_partials'].reduce((out, property) => {
            out[property] = Object.assign({}, baseConf[property] || {}, pageConf[property] || {});
            return out;
        }, {});

        return Object.assign({}, baseConf, pageConf, mergedList);
    }

    getPagesToBuild(filePaths, bypassFilter) {
        const out = [];

        for (const pathSchema in this.config.paths) {
            const baseConf = this.utils.readAndParse(`${this.config.src}/${this.config.paths[pathSchema]}`);

            filePaths.filter( filePath => bypassFilter ? true : minimatch(filePath, `${this.config.src}/${pathSchema}`) ).forEach(
                filePath => out.push(this.getMergedConf(baseConf, this.utils.readAndParse(filePath)))
            );
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
