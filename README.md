## Install
Run `npm i minimatic` or `yarn add minimatic`

## Hierarchy

In minimatic you have 3 levels of configuration:
- Project
- Collections
- Pages

A project is composed of several collections which are composed of several pages.

## Project level configuration

Create a `config.js` module in the root directory of your project:

```js
module.exports = {
  ...
};
```

This config file suuports the following properties:

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| src         | String   | Path to your source files folder | ✅ |
| output      | String   | Output folder of your project | ✅ |
| preBuild    | Function | A function to run before the build (generally to fetch data from an API) | |
| postBuild   | Function | A function to run after the build (generally to build CSS, JS, optimize images, ...) | |
| partials    | Object   | An object of partials used by mustache: keys is partial name, value is partial file path relative to the src property | |
| collections | Object   | An object of partials used by mustache: keys is partial name, value is partial file path relative to the src property | ✅ |