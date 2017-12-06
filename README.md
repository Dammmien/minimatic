## Builder configuration in `config.json`
	...
	{
	    "data" : { ... },
	    "src": "./tests",
	    "output": "./output",
	    "paths": {
	        "/content/collections/*.md": "/metadata/collections.json"
	    }
	}
	...


## Build
`npm run build` to build project.


## Global logic
It calls build.js which instanciate `Builder` class and launch `Builder.build()`;
It will clean the output folder of the configuration.
And then build pages to finally copy statics assets (images, css, js, fonts, ...) from `src/assets` to `output/assets`.


## Pages build

### 1. List pages to build
All pages are in the `src/content/../../*.md` folder and are .md files.
You can organize your pages in subfolders.

### 2. Build each page
For each page we will instanciate a `Page` class with the project configuration and launch the build of the page with `Page.render`.
It will render the page with mustache using `Page.template`, `Page.data` and `Page.partials`.
- `Page.template` come from the property `_template` in the configuration of the page.
- `Page.data` is a merge of different configuration object.
- `Page.partials` used the property `_partials` of the configuration of the page. It can import other mustache template.

The path of the HTML output file is provided by the path of the file by replacing .md by .html.
