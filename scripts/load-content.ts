const dl = require("download-github-repo");
const fs = require("fs-extra");

const start = async () => {
  fs.ensureDirSync("content");
  fs.ensureDirSync("content/data");
  fs.ensureDirSync("content/cards");
  fs.ensureDirSync("content/rules");

  const cards = await fetch("https://ledercardcdn.seiyria.com/cards.json");
  fs.writeJsonSync("content/data/cards.json", await cards.json());

  console.log("cloned cards data");

  const faq = await fetch("https://ledercardcdn.seiyria.com/faq.json");
  fs.writeJsonSync("content/data/faq.json", await faq.json());

  console.log("cloned faq data");

  const errata = await fetch("https://ledercardcdn.seiyria.com/errata.json");
  fs.writeJsonSync("content/data/errata.json", await errata.json());

  console.log("cloned errata data");

  const meta = await fetch("https://ledercardcdn.seiyria.com/meta.json");
  const metaData = await meta.json();
  const products = metaData.products;

  const productList = products
    .filter((p) => p.external.rules)
    .map((p) => ({ name: p.name, value: p.id }));
  fs.writeJsonSync("content/data/products.json", productList);

  console.log("cloning rules");
  products.forEach(async (product) => {
    if (!product.external.rules) return;

    try {
      const rules = await fetch(`${product.external.rules}/assets/rules.json`);
      fs.writeJsonSync(`content/rules/${product.id}.json`, await rules.json());
    } catch {
      try {
        const rules = await fetch(
          `${product.external.rules}/assets/i18n/rules/en-US.json`
        );
        fs.writeJsonSync(
          `content/rules/${product.id}.json`,
          await rules.json()
        );
      } catch {
        console.error("failed to load rules for", product.id);
      }
    }

    console.log("got rules for", product.id);
  });

  /*
  console.log("cloning card images and symbols...");
  dl("LederCards/cards", "content/_cards", (err) => {
    if (err) return;

    console.log("cloned card images");

    fs.copySync("content/_cards/content/card-images", "content/cards/images");
    fs.copySync("content/_cards/content/card-symbols", "content/cards/symbols");
    fs.removeSync("content/_cards");
  });
  */
};

start();
