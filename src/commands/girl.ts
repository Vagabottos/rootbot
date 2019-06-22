
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import * as Discord from 'discord.js';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { WikiService } from '../services/wiki';
import { Logger } from '../services/logger';
import { PresenceService } from '../services/presence';
import { EmojiService } from '../services/emoji';

const CHAR_COLORS = {
  Light: 0xfdd754,
  Dark: 0x9d25ec,
  Aqua: 0x39a7ee,
  Flame: 0xef851d,
  Forest: 0x61c638,
  Void: 0xb6b6b6
};

@Singleton
@AutoWired
export class GirlCommand implements ICommand {

  help = 'Display a magical girl\'s data!';
  aliases = ['girl', 'g'];

  @Inject private logger: Logger;
  @Inject private presenceService: PresenceService;
  @Inject private emojiService: EmojiService;
  @Inject private wikiService: WikiService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const girl = this.wikiService.searchGirls(args);
    if (!girl) {
      message.channel.send(`Sorry! I could not find anything like "${args}".`);
      return;
    }

    try {
      const girlData = await this.wikiService.parseSpecificGirlPage(girl);

      const embed = new Discord.RichEmbed()
        .setAuthor(`${girlData.name}`, girlData.attImage)
        .setTitle('See it on the Wiki')
        .setURL(girlData.wikiLink)
        .setThumbnail(girlData.image)
        .setColor(CHAR_COLORS[girlData.att]);

      embed.addField('Type', girlData.type, true);

      if (girlData.memoria) {
        embed.addField('Memoria', `[${girlData.memoria}](${girlData.memoriaLink})`, true);
      }

      embed.addField('Discs', girlData.discs.map((x) => this.emojiService.getEmoji(`disc_${x.toString().toLowerCase()}`)).join(' '), true);

      const hpatkdefString = girlData.hp.toLocaleString() + ' / ' + girlData.atk.toLocaleString() + ' / ' + girlData.def.toLocaleString();
      embed.addField('HP / ATK / DEF', hpatkdefString, true);

      if (girlData.connect) {
        embed.addField(`Connect: ${girlData.connect.name}`, girlData.connect.abilities.map(({ name, value }) => {
          return `· ${name} - ${value}`;
        }).join('\n'));
      }

      if (girlData.magia) {
        embed.addField(`Magia${girlData.magia2 ? ' 1' : ''}: ${girlData.magia.name}`, girlData.magia.abilities.map(({ name, value }) => {
          return `· ${name} - ${value}`;
        }).join('\n'));
      }

      if (girlData.magia2) {
        embed.addField(`Magia 2: ${girlData.magia2.name}`, girlData.magia2.abilities.map(({ name, value }) => {
          return `· ${name} - ${value}`;
        }).join('\n'));
      }

      if (girlData.doppel) {
        embed.addField(`Doppel: ${girlData.doppel.name}`, girlData.doppel.effects.map((val) => {
          return `· ${val}`;
        }).join('\n'));
      }

      this.presenceService.setPresence(girlData.name);

      message.channel.send(embed);

    } catch (e) {
      this.logger.error(e);
      message.channel.send('Sorry! I could not open that wiki page for some reason.');
    }

    return { };
  }
}
