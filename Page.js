const fs = require('fs');

module.exports = class Page {

    constructor(config, builder) {
        this.builder = builder;
        this.config = config;
        this.template = fs.readFileSync(`${this.builder.config.src}/${this.config.template}`, 'utf8');
        this.output = `${this.builder.config.output}/${this.config.output}`;
    }

    get partials() {
        const out = {};
        for (var key in this.config.partials) out[key] = fs.readFileSync(`${this.builder.config.src}/${this.config.partials[ key ]}`, 'utf8');
        return out;
    }

    importDirectory(directory) {
        return this.builder.getPagesToBuild(directory).map(config => {
            const page = new Page(config, this.builder);
            config.data = page.data;
            return config;
        });
    }

    import () {
        const out = {};

        for (var key in this.config.import) {
            const file = this.config.import[key];

            if (fs.lstatSync(`${this.builder.config.src}/${file}`).isDirectory()) {
                out[key] = this.importDirectory(`${this.builder.config.src}/${file}`);
            } else {
                out[key] = JSON.parse(fs.readFileSync(`${this.builder.config.src}/${file}`, 'utf8'));
            }
        }

        return out;
    }

    get data() {
        return Object.assign({
            config: this.builder.config
        }, this.config.data, this.import());
    }

}
