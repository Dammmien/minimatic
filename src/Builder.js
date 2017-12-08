const Page = require('./Page');
const Utils = require('./Utils');
const fs = require('fs');
const minimatch = require("minimatch");

module.exports = class Builder {

    constructor(project) {
        this.project = project;
        this.Utils = new Utils();
    }

    build() {
        this.cleanOutput();
        this.buildPages();
        this.copyAssets();
        this.copyAdmin();
    }

    cleanOutput() {
        const startCleaning = Date.now();
        this.Utils.removeDirectory(this.project.output);
        console.log(`Output folder cleaned in ${Date.now() - startCleaning} ms.`);
    }

    copyAdmin() {
        const startAdmin = Date.now();
        this.Utils.recursiveCopy(`./admin`, `${this.project.output}/admin`);
        console.log(`Admin folder copied in ${Date.now() - startAdmin} ms.`);
    }

    copyAssets() {
        const startAssets = Date.now();
        this.Utils.recursiveCopy(`${this.project.src}/assets`, `${this.project.output}/assets`);
        console.log(`Assets folder copied in ${Date.now() - startAssets} ms.`);
    }

    buildPages() {
        const startBuild = Date.now();
        const filesPath = this.Utils.getFilesPath(`${this.project.src}/content`);
        const pages = this.getPages(filesPath);
        pages.forEach(page => page.render());
        console.log(`${pages.length} pages built in ${Date.now() - startBuild} ms.`);
    }

    getPages(filePaths) {
        const out = [];

        for (const pathSchema in this.project.paths) {
            const metadata = this.Utils.readAndParse(`${this.project.src}/${this.project.paths[pathSchema]}`);

            filePaths.forEach( filePath => {
                if ( minimatch(filePath, `${this.project.src}/${pathSchema}`) ) {
                    out.push(new Page({
                        metadata,
                        filePath,
                        project: this.project
                    }));
                }
            });
        }

        return out;
    }
}
