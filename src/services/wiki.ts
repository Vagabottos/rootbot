
import { AutoWired, Singleton, Inject } from 'typescript-ioc';
import * as xray from 'x-ray';
import * as FuzzySet from 'fuzzyset.js';

import { BaseService } from '../base/BaseService';
import { IGirlData, IMemoria } from '../interfaces';
import { Logger } from './logger';

const x = xray({
  filters: {
    strip: (value) => value ? value.replace(/\n/g, '').trim() : ''
  }
});

const GIRL_LIST_PAGE = 'https://magireco.fandom.com/wiki/MagicalOverview';
const MEMORIA_LIST_PAGE = 'https://magireco.fandom.com/wiki/MemoriaOverview';

@Singleton
@AutoWired
export class WikiService extends BaseService {

  @Inject private logger: Logger;

  private girlSprites: { [key: string]: string } = {};
  private girlAliases: { [key: string]: string } = {};
  private girlSet = new FuzzySet();

  private memoriaSprites: { [key: string]: string } = {};
  private memoriaAliases: { [key: string]: string } = {};
  private memoriaSet = new FuzzySet();

  async init(client) {
    super.init(client);

    await this.parsePages();

    setInterval(() => {
      this.parsePages();
    }, 60 * 60 * 1000);
  }

  public searchGirls(name: string): string {
    const found = this.girlSet.get(name);
    if (!found) { return null; }

    return this.girlAliases[found[0][1]];
  }

  public searchMemoria(name: string): string {
    const found = this.memoriaSet.get(name);
    if (!found) { return null; }

    return this.memoriaAliases[found[0][1]];
  }

  public async parseSpecificGirlPage(name: string): Promise<IGirlData> {
    const wikiLink = `https://magireco.fandom.com/wiki/${encodeURIComponent(name)}`;
    const wikiAbiLink = `https://magireco.fandom.com/wiki/${encodeURIComponent(name)}/Abilities`;

    const baseDataPage = x(wikiLink, '#mw-content-text', {
      attImage: 'th a img@data-src',
      att: 'th a img@alt',
      discs: x('tr:nth-child(2) td[colspan=2] p a', [{ disc: 'img@alt' }]),
      type: 'tr:nth-child(3) td p | strip',
      memoria: 'tr:nth-child(8) p a@title | strip',
      hp: 'tr:nth-child(14) td:nth-child(2)',
      atk: 'tr:nth-child(14) td:nth-child(3)',
      def: 'tr:nth-child(14) td:nth-child(4)'
    });

    const abiDataPage = x(wikiAbiLink, '#mw-content-text', {

      // either an EX skill or a Connect
      wikitable1:     x('.wikitable:nth-of-type(1)', {
        name: 'tr:nth-child(1) th:nth-child(1) | strip',
        effects: x('.wikitable:nth-of-type(1) tr:not(:first-child)', [{
          name: 'td:nth-child(1) | strip',
          effect1: 'td:nth-child(2) | strip',
          effect2: 'td:nth-child(3) | strip',
          effect3: 'td:nth-child(4) | strip'
        }])
      }),

      // either a Connect or a Magia
      wikitable2:     x('.wikitable:nth-of-type(2)', {
        name: 'tr:nth-child(1) th:nth-child(1) | strip',
        effects: x('.wikitable:nth-of-type(2) tr:not(:first-child)', [{
          name: 'td:nth-child(1) | strip',
          effect1: 'td:nth-child(2) | strip',
          effect2: 'td:nth-child(3) | strip',
          effect3: 'td:nth-child(4) | strip'
        }])
      }),

      // either a Magia ... or a Magia
      wikitable3:     x('.wikitable:nth-of-type(3)', {
        name: 'tr:nth-child(1) th:nth-child(1) | strip',
        effects: x('.wikitable:nth-of-type(3) tr:not(:first-child)', [{
          name: 'td:nth-child(1) | strip',
          effect1: 'td:nth-child(2) | strip',
          effect2: 'td:nth-child(3) | strip',
          effect3: 'td:nth-child(4) | strip'
        }])
      }),

      // always a Magia (for chars like Ultimate Madoka)
      wikitable4:     x('.wikitable:nth-of-type(4)', {
        name: 'tr:nth-child(1) th:nth-child(1) | strip',
        effects: x('.wikitable:nth-of-type(4) tr:not(:first-child)', [{
          name: 'td:nth-child(1) | strip',
          effect1: 'td:nth-child(2) | strip',
          effect2: 'td:nth-child(3) | strip',
          effect3: 'td:nth-child(4) | strip'
        }])
      }),

      // always a doppel
      articletable:   x('.article-table', {
        name: 'tr:nth-child(1) th:nth-of-type(1) | strip',
        effects: 'tr:nth-child(4) td | strip'
      })
    });

    const [data, abiData] = await Promise.all([baseDataPage, abiDataPage]);

    const girl: IGirlData = {
      name,
      image: this.girlSprites[name],
      wikiLink,
      attImage: data.attImage,
      att: data.att.split(' ')[1],
      type: data.type,
      discs: data.discs.map((d: { disc: string }) => d.disc),
      memoria: data.memoria,
      memoriaLink: `https://magireco.fandom.com/wiki/${encodeURIComponent(data.memoria)}`,
      hp: +data.hp.split('➜')[1].split(',').join(''),
      atk: +data.atk.split('➜')[1].split(',').join(''),
      def: +data.def.split('➜')[1].split(',').join(''),
      connect: null,
      magia: null,
      magia2: null,
      doppel: null
    };

    // articletable = doppel, magia, and connect
    if (abiData.articletable.name) {
      girl.doppel = {
        name: abiData.articletable.name.split('<br>').join(' / '),
        effects: abiData.articletable.effects.split('&').map((d) => d.trim())
      };

      girl.connect = {
        name: abiData.wikitable1.name,
        abilities: abiData.wikitable1.effects.map((e) => ({ name: e.name, value: e.effect3 || e.effect2 }))
      };

      girl.magia = {
        name: abiData.wikitable2.name,
        abilities: abiData.wikitable2.effects.map((e) => ({ name: e.name, value: e.effect2 || e.effect1 }))
      };

    // no articletable + wikitable4 = magia1, magia2, connect, exskill
    } else if (abiData.wikitable4.name) {
      girl.connect = {
        name: abiData.wikitable2.name,
        abilities: abiData.wikitable2.effects.map((e) => ({ name: e.name, value: e.effect3 || e.effect2 }))
      };

      girl.magia = {
        name: abiData.wikitable3.name,
        abilities: abiData.wikitable3.effects.map((e) => ({ name: e.name, value: e.effect2 || e.effect1 }))
      };

      girl.magia2 = {
        name: abiData.wikitable4.name,
        abilities: abiData.wikitable4.effects.map((e) => ({ name: e.name, value: e.effect1 }))
      };

    // no articletable + no wikitable4 = magia1, magia2, connect
    } else {
      girl.connect = {
        name: abiData.wikitable1.name,
        abilities: abiData.wikitable1.effects.map((e) => ({ name: e.name, value: e.effect3 || e.effect2 }))
      };

      girl.magia = {
        name: abiData.wikitable2.name,
        abilities: abiData.wikitable2.effects.map((e) => ({ name: e.name, value: e.effect2 || e.effect1 }))
      };

      girl.magia2 = {
        name: abiData.wikitable3.name,
        abilities: abiData.wikitable3.effects.map((e) => ({ name: e.name, value: e.effect1 }))
      };
    }

    return girl;
  }

  public async parseSpecificMemoriaPage(name: string): Promise<IMemoria> {
    const wikiLink = `https://magireco.fandom.com/wiki/${encodeURIComponent(name)}`;

    const baseDataPage = x(wikiLink, '#mw-content-text', {
      attImage: 'div .wikitable caption img@src',
      att: 'div .wikitable caption img@alt',
      effect: 'div .wikitable tr:last-child',
      usableBy: '.wikiatable tr:nth-child(3) td | strip',
      hp: '.wikiatable tr:nth-child(6) td',
      atk: '.wikiatable tr:nth-child(7) td',
      def: '.wikiatable tr:nth-child(8) td'
    });

    const data: any = await baseDataPage;

    const memoria: IMemoria = {
      name,
      image: this.memoriaSprites[name],
      wikiLink,
      attImage: data.attImage,
      effects: data.effect.split('&').map((e) => e.trim()),
      usableBy: data.usableBy,
      att: data.att.split(' ')[1],
      hp: +data.hp.split('➜')[1],
      atk: +data.atk.split('➜')[1],
      def: +data.def.split('➜')[1]
    };

    return memoria;
  }

  private async parsePages() {
    await this.parseBaseGirlListWikiPage();
    await this.parseBaseMemoriaListWikiPage();
  }

  private async parseBaseGirlListWikiPage() {
    this.girlSet = new FuzzySet();

    let data = null;
    data = await x(GIRL_LIST_PAGE, 'h3+p+.article-table td div.floatnone', [{
      name: 'a@title',
      image: 'a img@data-src'
    }]);

    data.forEach(({ name, image }) => {

      this.girlSprites[name] = image;

      const aliases = [name, name.split(' ')[0]];
      aliases.forEach((alias) => {
        this.girlAliases[alias] = name;
        this.girlSet.add(alias);
      });
    });

    this.logger.log(`Loaded ${data.length} magical girls from wiki...`);

    return data;
  }

  private async parseBaseMemoriaListWikiPage() {
    this.memoriaSet = new FuzzySet();

    let data = null;
    data = await x(MEMORIA_LIST_PAGE, '.wikia-table td div.floatnone', [{
      name: 'a@title',
      image: 'a img@data-src'
    }]);

    data.forEach(({ name, image }) => {

      this.memoriaSprites[name] = image;

      const aliases = [name];
      aliases.forEach((alias) => {
        this.memoriaAliases[alias] = name;
        this.memoriaSet.add(alias);
      });
    });

    this.parseSpecificMemoriaPage('Lightning Blitz');
    this.logger.log(`Loaded ${data.length} memoria from wiki...`);

    return data;
  }

}
