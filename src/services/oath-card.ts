
import { AutoWired, Inject, Singleton } from 'typescript-ioc';
import * as YAML from 'yamljs';
import * as FuzzySet from 'fuzzyset.js';
import * as Discord from 'discord.js';
import fetch from 'node-fetch';

import { BaseService } from '../base/BaseService';
import { IOathCard } from '../interfaces';
import { EmojiService } from './emoji';

const SUIT_COLORS = {
  order: 0x1b418b,
  discord: 0x66220f,
  arcane: 0x82288d,
  hearth: 0xf83500,
  beast: 0xad240d,
  nomad: 0x33aa83
};

@Singleton
@AutoWired
export class OathCardService extends BaseService {

  @Inject private emojiService: EmojiService;

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

  public createEmbed(card): Discord.MessageEmbed {

    const attachFiles = [];

    let authorImage = null;

    if (card.suit) {
      attachFiles.push(`./content/oath/symbols/suit-${card.suit}.png`);
      authorImage = `attachment://suit-${card.suit}.png`;
    }

    const embed = new Discord.MessageEmbed()
      .attachFiles(attachFiles)
      .setDescription(this.formatTextForEmojis(card.text))
      .setAuthor(card.name, authorImage)
      .setImage(`https://oathcards.seiyria.com/assets/cards/${encodeURIComponent(card.image)}.png`)
      .setColor(SUIT_COLORS[card.suit]);

    if (card.initialLoadout) {
      embed.addField('Loadout', this.formatTextForEmojis(card.initialLoadout), true);
    }

    if (card.defense) {
      embed.addField('Defense', Array(card.defense).fill(null).map(() => this.emojiService.getEmoji(`symbol_diceb`)).join(''), true);
    }

    if (card.cardCapacity) {
      embed.addField('Capacity', `**${card.cardCapacity}**`, true);
    }

    if (card.relicRecoveryCost) {
      embed.addField('Relic Recovery Cost', this.formatTextForEmojis(card.relicRecoveryCost), true);
    }

    if (card.powerCost) {
      embed.addField('Power Cost', this.formatTextForEmojis(card.powerCost), true);
    }

    return embed;
  }

  private formatTextForEmojis(text: string): string {

    text = text.split('`symbol:').join('<emoji>:symbol_')
               .split('`suit:').join('<emoji>:suit_')
               .split('`').join('');

    const matches = text.match(/<emoji>:([a-zA-Z0-9_])+/g);
    if (!matches || !matches[0]) { return text; }

    matches.forEach((match) => {
      const [_, replace] = match.split(':');
      text = text.replace(match, this.emojiService.getEmoji(replace));
    });

    return text;
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
