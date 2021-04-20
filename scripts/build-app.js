
const childProcess = require('child_process');
const YAML = require('yamljs');
const imagemin = require('imagemin');
const webp = require('imagemin-webp');
const fs = require('fs-extra');
const reqdir = require('require-dir');
const dl = require('download-github-repo');

const style = process.argv[2].split('=')[1];

const fixImages = async () => {
  await imagemin([
    `./content/${style}/cards/*.png`
  ], {
    destination: `./content/${style}/cards`,
    plugins: [
      webp({
        quality: 40
      })
    ]
  });

  console.log('Done compressing images.');

};

fixImages();

// rimraf.sync('dist');
// fs.mkdirSync('dist');

const allCards = YAML.load(`content/${style}/cards.yml`);

const config = require(`${__dirname}/../content/${style}/config.json`);
const relevantInfo = allCards.map(x => ({ name: x.name, image: x.image.split('.png').join('.webp'), imageClass: x.imageClass, set: x.set }));
const i18n = reqdir(`${__dirname}/../content/${style}/i18n`);

// clone the shell
dl('Vagabottos/cards-app-shell', 'dist', () => {

  // set it up and compile it
  childProcess.execSync('cd dist && npm install && npm run build');

  // copy favicon icons
  fs.copySync(`${__dirname}/../content/${style}/favicon`, 'dist/www/assets/favicon');

  // copy cards
  fs.copySync(`content/${style}/cards`, 'dist/www/assets/cards');

  // rewrite index.html
  const html = fs.readFileSync('dist/www/index.html', 'UTF-8');
  const formattedHTML = html
    .split('$AppTitle$').join(config.AppTitle)
    .split('$AppDescription$').join(config.AppDescription)
    .split('$AppRootDomain$').join(config.AppRootDomain)
    .split('$AppThemeColor$').join(config.AppThemeColor)
    .split('<script type="text/javascript"></script>').join(`
      <script type="text/javascript">
        window.__config = ${JSON.stringify(config)};
        window.__cards = ${JSON.stringify(relevantInfo)};
        window.__i18n = ${JSON.stringify(i18n)};
      </script>
    `);

  fs.writeFileSync('dist/www/index.html', formattedHTML);

  // rewrite manifest.json
  const manifest = fs.readFileSync('dist/www/assets/favicon/manifest.json', 'UTF-8');
  const formattedManifest = manifest
    .split('$AppTitle$').join(config.AppTitle)
    .split('$AppShortTitle$').join(config.AppShortTitle)
    .split('$AppThemeColor$').join(config.AppThemeColor);

  fs.writeFileSync('dist/www/assets/favicon/manifest.json', formattedManifest);
});
