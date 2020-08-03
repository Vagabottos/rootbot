
const fs = require('fs');

let string = '';

fs.readdirSync('content/oath/cards')
  .forEach(file => {
    console.log(file);
    string += `
- name:
  image: ${file}
`
  })

fs.writeFileSync('content/oath/cards.yml', string);