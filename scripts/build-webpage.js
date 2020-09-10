
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
    <img class="lazy similar" src="placeholder.png" data-src="cards/${x.image}.png" />
  </div>
  `
});

const title = style.slice(0, 1).toUpperCase() + style.slice(1);
const formattedTemplate = template
  .split('<fillmein>').join(allCardInfos.join(''))
  .split('<addgamescripthere>').join(`<script>window.__gamename = '${title}'</script>`)
  .split('<addgamehere>').join(title);

fs.writeFileSync('dist/index.html', formattedTemplate);
fs.copySync('scripts/index.js', 'dist/index.js');
fs.copySync('scripts/index.css', 'dist/index.css');
fs.copySync('scripts/placeholder.png', 'dist/placeholder.png');
fs.copySync(`content/${style}/cards`, 'dist/cards');