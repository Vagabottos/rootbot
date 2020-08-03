
const YAML = require('yamljs');
const rimraf = require('rimraf');
const fs = require('fs-extra');

const style = process.argv[2].split('=')[1];

rimraf.sync('dist');
fs.mkdirSync('dist');

const template = fs.readFileSync('scripts/template.html', 'UTF-8');
const allCards = YAML.load(`content/${style}/cards.yml`);

const relevantInfo = allCards.map(x => ({ name: x.name, image: x.image }));

const allCardInfos = relevantInfo.map(x => {
  return `
  <div class="img-container">
    <div class="img-text">${x.name}</div>
    <img src="cards/${x.image}.png" />
  </div>
  `
});

const formattedTemplate = template.split('<fillmein>').join(allCardInfos.join(''));

fs.writeFileSync('dist/index.html', formattedTemplate);
fs.copySync(`content/${style}/cards`, 'dist/cards');