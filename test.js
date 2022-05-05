const template = require("./template.js");

const item = (data) => `
  <li>${data.name}</li>
`;

const loop = (list, partial) => list.map(partial).join('\n');

const data = [
  { name: 'Foo' },
  { name: 'Bar' }
];

console.log(template(data, { item }, { loop }));







function test(strings, ...args) {
  console.log(strings, args);
}


console.log( test`A ${1} B${2}`);