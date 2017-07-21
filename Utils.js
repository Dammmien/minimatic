const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const fm = require('front-matter');
const markdownParser = require('marked');

module.exports = class Utils {

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

    readAndParse(filePath) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        if (path.extname(filePath) === '.json') return JSON.parse(fileContent);
        if (path.extname(filePath) === '.yml') return yaml.safeLoad(fileContent);
        if (path.extname(filePath) === '.md') {
            const parsed = fm(fileContent);
            return Object.assign({}, parsed.attributes, {body: markdownParser(parsed.body)});
        }
    }

}
