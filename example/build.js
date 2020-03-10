const build = require('../src/build');

build({
  data: {
    dir_img: '/assets/images/',
    dir_styles: '/assets/styles/',
    dir_scripts: '/assets/scripts/'
  },
  src: 'example',
  output: 'www',
  collections: {
    'content/collections/pages': './example/content/pages',
    'content/collections/recipes': './example/content/recipes'
  }
});
