const fs = require('fs');
const Utils = require('./Utils');
const mustache = require('mustache');

module.exports = class Page {

    constructor(config) {
        this.project = config.project;
        this.utils = new Utils(this.project);
        this.data = this.getData(config.metadata, config.filePath, false);
        this.template = fs.readFileSync(`${this.project.src}/${this.data._template}`, 'utf8');
        this.output = config.filePath.replace(`${this.project.src}/content`, this.project.output).replace('.md', '.html');
    }

    getPartials() {
        const out = {};
        for (var key in this.data._partials) out[key] = fs.readFileSync(`${this.project.src}/${this.data._partials[ key ]}`, 'utf8');
        return out;
    }

   importDirectory(directory) {
        return this.utils.getFilesPath(directory).map(filePath => this.getData({}, filePath, true));
    }

    resolveImports(path, imports) {
        const out = {};

        for (const key in imports) {
            const isDirectory = this.utils.isDirectory(`${path}/${imports[key]}`);
            out[key] = isDirectory ? this.importDirectory(`${path}/${imports[key]}`) : this.utils.readAndParse(`${path}/${imports[key]}`);
        }

        return out;
    }

    /*
     * Return the configuration of a page with all the configurations merged : {}
     */
    getData(baseConf, filePath, disableImports = false) {
        const pageConf = this.utils.readAndParse(filePath);

        const listConfs = [
            this.project.data,
            disableImports ? {} : this.resolveImports(this.project.src, baseConf._imports || {}),
            baseConf,
            disableImports ? {} : this.resolveImports(this.project.src, pageConf._imports || {}),
            pageConf
        ];

        const out = listConfs.reduce((out, conf) => this.utils.merge(out, conf), {});

        delete out._imports;

        return out;
    }

    render() {
        try {
            this.utils.writeFile(this.output, mustache.render(this.template, this.data, this.getPartials()));
        } catch (error) {
            console.log(`\x1B[31mError during processing ${this.output} : ${error.message}\x1B[0m`);
        }
    }

}
