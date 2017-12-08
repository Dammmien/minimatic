const fs = require('fs');
const path = require('path');
const fm = require('front-matter');
const markdownParser = require('marked');
const yaml = require('js-yaml');

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
        return fs.readdirSync(directory).reduce((files, file) => {
            const path = `${directory}/${file}`;
            return files.concat(this.isDirectory(path) ? this.getFilesPath(path) : [path]);
        }, []);
    }

    parseMarkdown(fileContent){
        const parsed = fm(fileContent);
        return Object.assign({}, parsed.attributes, { body: markdownParser(parsed.body) });
    }

    readAndParse(filePath) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        if (path.extname(filePath) === '.json') return JSON.parse(fileContent);
        if (path.extname(filePath) === '.yml') return yaml.safeLoad(fileContent);
        if (path.extname(filePath) === '.md') return this.parseMarkdown(fileContent);
    }

}
