const Page = require('./Page');
const Utils = require('./Utils');
const fs = require('fs');
const glob = require('glob');

module.exports = class Builder {

    build(project) {
        this.cleanOutput(project);
        this.buildPages(project);
        this.copyAssets(project);
        this.copyAdmin(project);
    }

    cleanOutput(project) {
        const startCleaning = Date.now();
        Utils.removeDirectory(project.output);
        console.log(`Output folder cleaned in ${Date.now() - startCleaning} ms.`);
    }

    copyAdmin(project) {
        const startAdmin = Date.now();
        Utils.recursiveCopy(`./admin`, `${project.output}/admin`);
        console.log(`Admin folder copied in ${Date.now() - startAdmin} ms.`);
    }

    copyAssets(project) {
        const startAssets = Date.now();
        Utils.recursiveCopy(`${project.src}/assets`, `${project.output}/assets`);
        console.log(`Assets folder copied in ${Date.now() - startAssets} ms.`);
    }

    buildPages(project) {
        const startBuild = Date.now();
        const pages = this.getPages(project).map(page => page.render());
        console.log(`${pages.length} pages built in ${Date.now() - startBuild} ms.`);
    }

    getPages(project) {
        const out = [];

        for (const pathSchema in project.paths) {
            const metadata = Utils.readAndParse(`${project.src}/${project.paths[pathSchema]}`);
            glob.sync(`${project.src}/${pathSchema}`).forEach( filePath => out.push(new Page({ metadata, filePath, project})));
        }

        return out;
    }
}
