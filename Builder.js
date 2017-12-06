const Page = require('./Page');
const Utils = require('./Utils');
const fs = require('fs');
const minimatch = require("minimatch");

module.exports = class Builder {

    constructor(config) {
        this.config = config;
        this.utils = new Utils(config);
    }

    build() {
        this.cleanOutput();
        this.buildPages();
        this.copyAssets();
        this.copyAdmin();
    }

    cleanOutput() {
        const startCleaning = Date.now();
        this.utils.removeDirectory(this.config.output);
        console.log(`Output folder cleaned in ${Date.now() - startCleaning} ms.`);
    }

    copyAdmin() {
        const startAdmin = Date.now();
        this.utils.recursiveCopy(`./admin`, `${this.config.output}/admin`);
        console.log(`Admin folder copied in ${Date.now() - startAdmin} ms.`);
    }

    copyAssets() {
        const startAssets = Date.now();
        this.utils.recursiveCopy(`${this.config.src}/assets`, `${this.config.output}/assets`);
        console.log(`Assets folder copied in ${Date.now() - startAssets} ms.`);
    }

    buildPages() {
        const startBuild = Date.now();
        const filesPath = this.utils.getFilesPath(`${this.config.src}/content`);
        const pagesToBuild = this.getPagesToBuild(filesPath);
        pagesToBuild.forEach(page => page.render());
        console.log(`${pagesToBuild.length} pages built in ${Date.now() - startBuild} ms.`);
    }

    getPagesToBuild(filePaths) {
        const out = [];

        for (const pathSchema in this.config.paths) {
            const baseConf = this.utils.readAndParse(`${this.config.src}/${this.config.paths[pathSchema]}`);

            filePaths.forEach( filePath => {
                if ( minimatch(filePath, `${this.config.src}/${pathSchema}`) ) {
                    out.push(new Page(this.utils.getPageConf(baseConf, filePath, false), this));
                }
            });
        }

        return out;
    }
}
