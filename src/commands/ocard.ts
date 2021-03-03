
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import * as Discord from 'discord.js';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { PresenceService } from '../services/presence';
import { OathCardService } from '../services/oath-card';
import { EmojiService } from '../services/emoji';

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
export class OathCardCommand implements ICommand {

  help = 'Display an Oath card! Do `-ocard Pressgangs` to search for the Pressgangs card.';
  aliases = ['ocard'];

  @Inject private cardService: OathCardService;
  @Inject private emojiService: EmojiService;
  @Inject private presenceService: PresenceService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const card = this.cardService.getCard(args);
    if (!card) {
      message.channel.send(`Sorry! I could not find anything like "${args}"`);
      return;
    }

    const faq = await this.cardService.getFAQ(card.name);

    const attachFiles = [];

    let authorImage = null;

    if (card.suit) {
      attachFiles.push(`./content/oath/symbols/suit-${card.suit}.png`);
      authorImage = `attachment://suit-${card.suit}.png`;
    }

    const embed = new Discord.RichEmbed()
      .attachFiles(attachFiles)
      .setDescription(this.formatTextForEmojis(card.text))
      .setAuthor(card.name, authorImage)
      .setImage(`https://oathcards.seiyria.com/assets/cards/${encodeURIComponent(card.image)}.png`)
      .setColor(SUIT_COLORS[card.suit]);

    if (faq) {
      embed.setFooter(`This card has FAQ associated with it. Do \`-ofaq ${card.name}\` to see it.`);
    }

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

    this.presenceService.setPresence(`with ${card.name}`);

    message.channel.send({ embed });

    return { };
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

}
