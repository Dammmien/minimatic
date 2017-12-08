const fs = require('fs');
const Utils = require('./Utils');
const mustache = require('mustache');

module.exports = class Page {

    constructor(config) {
        this.project = config.project;
        this.data = this.getData(config.metadata, config.filePath, false);
        this.template = fs.readFileSync(`${this.project.src}/${this.data.statik_template}`, 'utf8');
        this.output = this.getOutputPath(config);
    }

    getOutputPath(config) {
        if (this.data.statik_output) {
            return `${this.project.output}/${this.data.statik_output}`;
        } else {
            return config.filePath.replace(`${this.project.src}/content`, this.project.output).replace('.md', '.html');
        }
    }

    getPartials() {
        const out = {};
        for (var key in this.data.statik_partials) out[key] = fs.readFileSync(`${this.project.src}/${this.data.statik_partials[ key ]}`, 'utf8');
        return out;
    }

    importDirectory(directory) {
        return Utils.getFilesPath(directory).map(filePath => this.getData({}, filePath, true));
    }

    resolveImports(path, imports) {
        const out = {};

        for (const key in imports) {
            const isDirectory = Utils.isDirectory(`${path}/${imports[key]}`);
            out[key] = isDirectory ? this.importDirectory(`${path}/${imports[key]}`) : Utils.readAndParse(`${path}/${imports[key]}`);
        }

        return out;
    }

    /*
     * Return the configuration of a page with all the configurations merged : {}
     */
    getData(baseConf, filePath, disableImports = false) {
        const pageConf = Utils.readAndParse(filePath);
        return [
            this.project.data,
            disableImports ? {} : this.resolveImports(this.project.src, baseConf.statik_imports || {}),
            baseConf,
            disableImports ? {} : this.resolveImports(this.project.src, pageConf.statik_imports || {}),
            pageConf
        ].reduce((out, conf) => Utils.merge(out, conf), {});
    }

    render() {
        try {
            Utils.writeFile(this.output, mustache.render(this.template, this.data, this.getPartials()));
        } catch (error) {
            console.log(`\x1B[31mError during processing ${this.output} : ${error.message}\x1B[0m`);
        }
    }

}
