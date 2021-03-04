
import * as Discord from 'discord.js';
import { Inject, AutoWired, Singleton } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { PresenceService } from '../services/presence';
import { OathCardService } from '../services/oath-card';

@Singleton
@AutoWired
export class OathFAQCommand implements ICommand {

  help = 'Display FAQ for an Oath card! Do `-ofaq Wrestlers` to get the FAQ for the Wrestlers card.';
  aliases = ['ofaq'];

  @Inject private cardService: OathCardService;
  @Inject private presenceService: PresenceService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const card = this.cardService.getCard(args);
    if (!card) {
      message.channel.send(`Sorry! I could not find anything like "${args}"`);
      return;
    }

    const faq = await this.cardService.getFAQ(card.name);
    if (!faq) {
      message.channel.send(`Sorry! I could not find any FAQ for "${card.name}". I will attach the card for reference:`);
      message.channel.send({ embed: this.cardService.createEmbed(card) });
      return;
    }

    const attachFiles = [
      // `./content/oath/cards/${card.image}.png`
    ];

    const embed = new Discord.RichEmbed()
      .setImage(`https://oathcards.seiyria.com/cards/${encodeURIComponent(card.image)}.png`)

    faq.forEach(({ q, a }) => {
      embed.addField(`**Q**: ${this.trimExtra(q)}`, `**A**: ${this.trimExtra(a)}`);
    });

    this.presenceService.setPresence(`with ${card.name}`);

    message.channel.send({ embed });

    return { };
  }

  private trimExtra(msg: string): string {
    return msg.split('$link:').join('').split('$rule:').join('').split('$').join('');
  }

}
