const fs = require('fs');
const Utils = require('./Utils');

module.exports = class Page {

    constructor(config, builder) {
        this.utils = new Utils();
        this.builder = builder;
        this.config = config;
        this.template = fs.readFileSync(`${this.builder.config.src}/${this.config._template}`, 'utf8');
        this.output = `${this.builder.config.output}/${this.config._output}`;
        this.data = Object.assign({ _config: this.builder.config }, this.config, this.import());
    }

    get partials() {
        const out = {};
        for (var key in this.config._partials) out[key] = fs.readFileSync(`${this.builder.config.src}/${this.config._partials[ key ]}`, 'utf8');
        return out;
    }

    importDirectory(directory) {
        const filePaths = this.builder.getFilesPath(directory);
        return this.builder.getPagesToBuild(filePaths).filter(
            config => config._output !== this.config._output
        ).map(config => {
            const page = new Page(config, this.builder);
            config.data = page.data;
            return config;
        });
    }

    import () {
        return Object.keys(this.config._imports || {}).reduce((out, key) => {
            const file = this.config._imports[key];

            if (fs.lstatSync(`${this.builder.config.src}/${file}`).isDirectory()) {
                out[key] = this.importDirectory(`${this.builder.config.src}/${file}`);
            } else {
                out[key] = this.utils.readAndParse(`${this.builder.config.src}/${file}`);
            }

            return out;
        }, {});
    }

}
