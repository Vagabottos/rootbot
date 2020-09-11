
const fs = require('fs');

let string = '';

fs.readdirSync('.').forEach(f => {
  if(!f.includes('.png')) return;
  
  string += `
- name: ${f}
  image: ${f}
  `

});

fs.writeFileSync('cards.yml', string);