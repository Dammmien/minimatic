const fs = require('fs');
const path = require('path');
const fm = require('front-matter');
const markdownParser = require('marked');

module.exports = class Utils {

    constructor(config) {
        this.config = config;
    }

    isDirectory(filePath) {
        return fs.lstatSync(filePath).isDirectory();
    }

    removeDirectory(directory) {
        if (fs.existsSync(directory)) {
            fs.readdirSync(directory).forEach(file => {
                if (this.isDirectory(`${directory}/${file}`)) this.removeDirectory(`${directory}/${file}`);
                else fs.unlinkSync(`${directory}/${file}`);
            });
            fs.rmdirSync(directory);
        }
    }

    ensureDirectoryExistence(filePath) {
        const dirname = path.dirname(filePath);
        if (fs.existsSync(dirname)) return true;
        this.ensureDirectoryExistence(dirname);
        fs.mkdirSync(dirname);
    }

    writeFile(destination, content) {
        this.ensureDirectoryExistence(destination);
        fs.writeFileSync(destination, content);
    }

    recursiveCopy(source, destination) {
        fs.readdirSync(source).forEach(file => {
            if (this.isDirectory(`${source}/${file}`)) this.recursiveCopy(`${source}/${file}`, `${destination}/${file}`);
            else this.writeFile(`${destination}/${file}`, fs.readFileSync(`${source}/${file}`));
        });
    }

    merge(a, b) {
        const out = Object.assign({}, a);

        for (const key in b) {
            if (out[key]) {
                if (Array.isArray(out[key])) out[key] = [ ...out[key], b[key] ];
                else if (typeof out[key] === 'object') out[key] = this.merge(out[key], b[key]);
                else out[key] = b[key];
            } else {
                out[key] = b[key];
            }
        }

        return out;
    }

    /*
     * Return a flatten list of all the files path in a directory (recursive) : [ '', '' ]
     */
    getFilesPath(directory) {
        let files = [];
        fs.readdirSync(directory).forEach(file => {
            if (this.isDirectory(`${directory}/${file}`)) files = files.concat(this.getFilesPath(`${directory}/${file}`));
            else files.push(`${directory}/${file}`);
        });
        return files;
    }

    importDirectory(directory) {
        return this.getFilesPath(directory).map(filePath => this.getPageConf({}, filePath, true));
    }

    getImports(path, imports) {
        const out = {};

        for (const key in imports) {
            if (fs.lstatSync(`${path}/${imports[key]}`).isDirectory()) {
                out[key] = this.importDirectory(`${path}/${imports[key]}`);
            } else {
                out[key] = this.readAndParse(`${path}/${imports[key]}`);
            }
        }

        return out;
    }

    /*
     * Return the configuration of a page with all the configurations merged : {}
     */
    getPageConf(baseConf, filePath, disableImports = false){
        const pageConf = this.readAndParse(filePath);

        const listConfs = [
            { _src_path : filePath },
            this.config.data,
            disableImports ? {} : this.getImports(this.config.src, baseConf._imports || {}),
            baseConf,
            disableImports ? {} : this.getImports(this.config.src, pageConf._imports || {}),
            pageConf
        ];

        const out = listConfs.reduce((out, conf) => this.merge(out, conf), {});

        delete out._imports;

        return out;
    }

    readAndParse(filePath) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        if (path.extname(filePath) === '.json') return JSON.parse(fileContent);
        if (path.extname(filePath) === '.md') {
            const parsed = fm(fileContent);
            return Object.assign({}, parsed.attributes, { body: markdownParser(parsed.body) });
        }
    }

}
