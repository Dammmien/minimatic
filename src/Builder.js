const Page = require('./Page');
const Utils = require('./Utils');
const fs = require('fs');
const minimatch = require('minimatch');

module.exports = class Builder {

    build(project) {
        this.cleanOutput(project);
        this.buildPages(project);
        this.copyAssets(project);
        this.runPostBuild(project);
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
        const filesPath = Utils.getFilesPath(`${project.src}/content`);
        const pages = this.getPages(project, filesPath);
        pages.forEach(page => page.render());
        console.log(`${pages.length} pages built in ${Date.now() - startBuild} ms.`);
    }

    runPostBuild(project) {
        if (typeof project.postBuild === 'function') {
            const startPostBuild = Date.now();
            project.postBuild();
            console.log(`Post build exectued in ${Date.now() - startPostBuild} ms.`);
        }
    }

    getPages(project, filePaths) {
        const out = [];

        for (const pathSchema in project.paths) {
            const metadata = Utils.readAndParse(`${project.src}/${project.paths[pathSchema]}`);

            filePaths.forEach( filePath => {
                if ( minimatch(filePath, `${project.src}/${pathSchema}`) ) out.push(new Page({ metadata, filePath, project}));
            });
        }

        return out;
    }
}
