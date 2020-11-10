
import { AutoWired, Singleton } from 'typescript-ioc';
import * as YAML from 'yamljs';
import * as FuzzySet from 'fuzzyset.js';
import fetch from 'node-fetch';

import { BaseService } from '../base/BaseService';
import { ICard } from '../interfaces';

@Singleton
@AutoWired
export class OathCardService extends BaseService {

  private cardsByName: { [key: string]: ICard } = {};
  private set: FuzzySet = new FuzzySet();
  private faqByCard: Record<string, any[]> = {};

  public async init(client) {
    super.init(client);

    this.loadCards();
    this.loadFAQ();
  }

  public getCard(name: string): ICard {
    const res = this.set.get(name);
    if (!res) { return null; }

    return this.cardsByName[res[0][1]];
  }

  public getFAQ(name: string): any[]|null {
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
    const faq = await fetch('https://dl.dropboxusercontent.com/s/qq3ckwivu0jixt4/oath.json?dl=0');
    const json = await faq.json();

    json.forEach(({ card, faq }) => {
      this.faqByCard[card] = faq;
    });
  }

}
