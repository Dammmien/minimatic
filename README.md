## Builder configuration in `config.json`
	...
	{
	    "data" : { ... },
	    "src": "./example",
	    "output": "./www",
	    "paths": {
	        "/content/collections/*.md": "/content/collections/collections.json"
	    }
	}
	...


## Build
`npm run build` or `yarn run build` to build your project.


## Global logic
It calls build.js which instanciate `Builder` class and launch `Builder.build()`;
It will clean the output folder of the configuration.
And then build pages to finally copy statics assets (images, css, js, fonts, ...) from `example/assets` to `output/assets`.


## Pages build

### 1. List pages to build
All pages are in the `example/content/../../*.md` folder and are .md files.
You can organize your pages in subfolders.

### 2. Build each page
For each page we will instanciate a `Page` class with the project configuration and launch the build of the page with `Page.render`.
It will render the page with mustache using `Page.template`, `Page.data` and `Page.partials`.
- `Page.template` come from the property `statik_template` in the configuration of the page.
- `Page.data` is a merge of different configuration object.
- `Page.partials` used the property `statik_partials` of the configuration of the page. It can import other mustache template.

The path of the HTML output file is provided by the path of the file by replacing .md by .html or can be overwrittent by `Page.data.output`.
