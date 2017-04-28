## Builder configuration in `package.json`
	...
	"config": {
		"src": "./src",
		"output": "./output"
	}
	...


## Build
`npm run build` to build project.


## Global logic
It calls scripts/build.js which instanciate `Builder` class and launch `Builder.build()`;
It will clean the output folder of the configuration.
And then build pages to finally copy statics assets (images, css, js, fonts, ...) from `src/assets` to `output/assets`.


## Pages build

### 1. List pages to build
All pages are in the `src/content/../../*.json` folder and are .json files.
You can organize your pages in subfolders.
To be a page the json file should have a `template` property.
Otherwise it's only a collection item, which won't be rendered.

### 2. Build each page
For each page we will instanciate a `Page` class with the project configuration and launch the build of the page with `Build.buildPage()`.
It will render the page with mustache using `Page.template`, `Page.data` and `Page.partials`.
- `Page.template` come from the property `template` in the json file of the page.
- `Page.data` is a merge of the property `data` from the json file of the page and the property `import` which allows the import of collection (folder of json files).
- `Page.partials` used the property `partials` of the json file of the page. It can import other mustache template or markdown file.

The path of the HTML output file is provided by the key `output` of the json file of the page.
