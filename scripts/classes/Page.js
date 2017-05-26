const fs = require('fs');

module.exports = class Page {

    constructor(config, builder) {
        this.builder = builder;
        this.config = config;
        this.src = process.env.npm_package_config_src;
        this.output = `${process.env.npm_package_config_output}/${this.config.output}`;
    }

    get template() {
        return fs.readFileSync(`${this.src}/templates/${this.config.template}`, 'utf8');
    }

    get partials() {
        let out = {};
        for (var key in this.config.partials) out[key] = fs.readFileSync(`${this.src}/${this.config.partials[ key ]}`, 'utf8');
        return out;
    }

    importDirectory(directory) {
        let pages = this.builder.getPagesToBuild(directory),
            collection = [];

        pages.forEach(config => {
            let page = new Page(config, this.builder);
            config.data = page.data;
            collection.push(config);
        });

        return collection;
    }

    import () {
        let out = {};
        for (var key in this.config.import) {
            let file = this.config.import[key];

            if (fs.lstatSync(`${this.src}/${file}`).isDirectory()) {
                out[key] = this.importDirectory(`${this.src}/${file}`);
            } else {
                out[key] = JSON.parse(fs.readFileSync(`${this.src}/${file}`, 'utf8'));
            }
        }
        return out;
    }

    get data() {
        return Object.assign({}, this.config.data, this.import());
    }

}
