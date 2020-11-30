
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import * as Discord from 'discord.js';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { PresenceService } from '../services/presence';
import { EmojiService } from '../services/emoji';
import { CardService } from '../services/card';

const CHAR_COLORS = {
  eyrie: 0x3B65A2,
  marquise: 0x3B65A2,
  corvid: 0x4A2769,
  cult: 0xE4DC31,
  duchy: 0xD5AF91,
  alliance: 0x5CA64C,
  riverfolk: 0x53B4AE,
  vagabond: 0xcccccc
};

@Singleton
@AutoWired
export class CardCommand implements ICommand {

  help = 'Display a card! Do `-rcard Tinker` to search for the Tinker card.';
  aliases = ['card', 'rcard'];

  @Inject private cardService: CardService;
  @Inject private presenceService: PresenceService;
  @Inject private emojiService: EmojiService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const card = this.cardService.getCard(args);
    if (!card) {
      message.channel.send(`Sorry! I could not find anything like "${args}"`);
      return;
    }

    const attachFiles = [
      `./content/root/cards/${card.image}.png`
    ];

    let authorImage = null;

    if (card.owner) {
      attachFiles.push(`./content/root/symbols/faction-${card.owner}.png`);
      authorImage = `attachment://faction-${card.owner}.png`;
    }

    if (card.type) {
      attachFiles.push(`./content/root/symbols/card-${card.type}.png`);
      authorImage = `attachment://card-${card.type}.png`;
    }

    const embed = new Discord.RichEmbed()
      .attachFiles(attachFiles)
      .setAuthor(card.name, authorImage)
      .setThumbnail(`attachment://${card.image}.png`)
      .setColor(CHAR_COLORS[card.owner]);

    if (card.text) {
      embed.addField('Text', this.formatTextForEmojis(card.text));
    }

    if (card.subtext) {
      embed.addField('Extra', this.formatTextForEmojis(card.subtext));
    }

    if (card.quest) {
      const clearingEmoji = this.emojiService.getEmoji(`card_${card.quest.type}`);
      const questEmoji = card.quest.cost.map((item) => this.emojiService.getEmoji(`item_${item}`));

      embed.addField('Quest', `${clearingEmoji} ⇒ ${questEmoji.join(' ')}`);
    }

    if (card.craft) {

      const craftEmoji = card.craft.cost.map((type) => this.emojiService.getEmoji(`card_${type}`));

      embed.addField('Craft', craftEmoji.join(' '));

      if (card.craft.item && card.craft.vp) {
        const itemEmoji = this.emojiService.getEmoji(`item_${card.craft.item}`);
        const vpEmoji = this.emojiService.getEmoji(`vp_${card.craft.vp}`);

        embed.addField('Craft Result', itemEmoji + ' ' + vpEmoji);
      }
    }

    this.presenceService.setPresence(`with ${card.name}`);

    message.channel.send({ embed });

    return { };
  }

  private formatTextForEmojis(text: string): string {

    const matches = text.match(/<emoji>:([a-zA-Z0-9_])+/g);
    if (!matches || !matches[0]) { return text; }

    matches.forEach((match) => {
      const [_, replace] = match.split(':');
      text = text.replace(match, this.emojiService.getEmoji(replace));
    });

    return text;
  }

}
