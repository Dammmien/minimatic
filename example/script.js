const fs = require('fs');

const files = fs.readdirSync('./content/recipes').forEach( file => {
  const json = JSON.parse(fs.readFileSync(`./content/recipes/${file}`, 'utf8'));
  const out = {
    output: json.output,
    data: {
      title: json.title,
      preparation_time: json.preparation_time,
      cooking_time: json.cooking_time,
      image: json.image,
      ingredients: json.ingredients,
      instructions: json.instructions
    }
  };

  fs.writeFileSync(`./content/recipes/${file}`, JSON.stringify(out, null, '  '));
} );


console.log( files );
