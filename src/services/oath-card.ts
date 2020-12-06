
import { AutoWired, Singleton } from 'typescript-ioc';
import * as YAML from 'yamljs';
import * as FuzzySet from 'fuzzyset.js';
import fetch from 'node-fetch';

import { BaseService } from '../base/BaseService';
import { IOathCard } from '../interfaces';

@Singleton
@AutoWired
export class OathCardService extends BaseService {

  private cardsByName: { [key: string]: IOathCard } = {};
  private set: FuzzySet = new FuzzySet();
  private faqByCard: Record<string, any[]> = {};

  public async init(client) {
    super.init(client);

    this.loadCards();
    this.loadFAQ();
  }

  public getCard(name: string): IOathCard {
    const res = this.set.get(name);
    if (!res) { return null; }

    return this.cardsByName[res[0][1]];
  }

  public async getFAQ(name: string): Promise<any[]|null> {
    await this.loadFAQ();
    return this.faqByCard[name];
  }

  private loadCards() {
    const cards = YAML.load('content/oath/cards.yml');

    cards.forEach((card) => {
      this.cardsByName[card.name] = card;
      this.set.add(card.name);
    });
  }

  private async loadFAQ() {
    try {
      
      const faqData = await fetch('https://dl.dropboxusercontent.com/s/qq3ckwivu0jixt4/oath.json?dl=0');
      const json = await faqData.json();

      json.forEach(({ card, faq }) => {
        this.faqByCard[card] = faq;
      });
    } catch(e) {
      console.error('FAQ could not be loaded.');
      console.error(e);
    }
  }

}
