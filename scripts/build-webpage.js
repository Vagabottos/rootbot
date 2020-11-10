
const YAML = require('yamljs');
const rimraf = require('rimraf');
const fs = require('fs-extra');

const style = process.argv[2].split('=')[1];

rimraf.sync('dist');
fs.mkdirSync('dist');

const faqUrls = {
  oath: 'https://dl.dropboxusercontent.com/s/qq3ckwivu0jixt4/oath.json?dl=0'
};

const template = fs.readFileSync('scripts/template.html', 'UTF-8');
const allCards = YAML.load(`content/${style}/cards.yml`);

const relevantInfo = allCards.map(x => ({ name: x.name, image: x.image, imageClass: x.imageClass, set: x.set }));

const title = style.slice(0, 1).toUpperCase() + style.slice(1);
const formattedTemplate = template
  .split('<addgamescripthere>').join(`
  <script>
    window.__gamename = '${title}';
    window.__gamedata = ${JSON.stringify(relevantInfo)};
    window.__faqurl = '${faqUrls[style] || ''}'
  </script>
  `)
  .split('<addgamehere>').join(title);

fs.writeFileSync('dist/index.html', formattedTemplate);
fs.copySync('scripts/index.js', 'dist/index.js');
fs.copySync('scripts/index.css', 'dist/index.css');
fs.copySync('scripts/placeholder.png', 'dist/placeholder.png');
fs.copySync(`content/${style}/cards`, 'dist/cards');