const fs = require('fs');
const Utils = require('./Utils');
const mustache = require('mustache');

module.exports = class Page {

    constructor(config, builder) {
        this.builder = builder;
        this.utils = new Utils(this.builder.config);
        this.data = config;
        this.template = fs.readFileSync(`${this.builder.config.src}/${this.data._template}`, 'utf8');
        this.output = this.data._src_path.replace(`${this.builder.config.src}/content`, this.builder.config.output).replace('.md', '.html');
    }

    get partials() {
        const out = {};
        for (var key in this.data._partials) out[key] = fs.readFileSync(`${this.builder.config.src}/${this.data._partials[ key ]}`, 'utf8');
        return out;
    }

    render() {
        try {
            this.utils.writeFile(this.output, mustache.render(this.template, this.data, this.partials));
        } catch (error) {
            console.log(`\x1B[31mError during processing ${this.output} : ${error.message}\x1B[0m`);
        }
    }

}
