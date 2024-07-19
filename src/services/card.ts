import * as fs from "fs-extra";
import * as FuzzySet from "fuzzyset.js";
import { AutoWired, Singleton } from "typescript-ioc";

import { BaseService } from "../base/BaseService";

@Singleton
@AutoWired
export class CardService extends BaseService {
  private cardsByName: { [key: string]: any } = {};
  private set: FuzzySet = new FuzzySet();

  private faq: Record<
    string,
    Record<
      string,
      Array<{ faq: Array<{ q: string; a: string }>; card: string }>
    >
  > = {};
  private errata: Record<
    string,
    Record<string, Array<{ errata: Array<{ text: string }>; card: string }>>
  > = {};

  public async init(client) {
    super.init(client);

    this.loadCards();

    this.faq = fs.readJsonSync("./content/data/faq.json");
    this.errata = fs.readJsonSync("./content/data/errata.json");
  }

  public getCard(name: string): any {
    const res = this.set.get(name);
    if (!res) {
      return null;
    }

    return this.cardsByName[res[0][1]];
  }

  public getFAQsForCard(product: string, cardName: string): any[] {
    const faqData = this.faq[product]["en-US"]?.find(
      (e) => e.card === cardName
    );
    return faqData?.faq ?? [];
  }

  public getErratasForCard(product: string, cardName: string): any[] {
    const errataData = this.errata[product]["en-US"]?.find(
      (e) => e.card === cardName
    );
    return errataData?.errata ?? [];
  }

  private loadCards() {
    const cards = fs.readJsonSync("./content/data/cards.json");

    cards.forEach((card) => {
      this.cardsByName[card.name] = card;
      this.set.add(card.name);
    });
  }
}
