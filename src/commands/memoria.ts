
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import * as Discord from 'discord.js';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { WikiService } from '../services/wiki';
import { Logger } from '../services/logger';
import { PresenceService } from '../services/presence';

@Singleton
@AutoWired
export class MemoriaCommand implements ICommand {

  help = 'Display a memoria\'s data!';
  aliases = ['memoria', 'm'];

  @Inject private logger: Logger;
  @Inject private presenceService: PresenceService;
  @Inject private wikiService: WikiService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const memoria = this.wikiService.searchMemoria(args);
    if (!memoria) {
      message.channel.send(`Sorry! I could not find anything like "${args}".`);
      return;
    }

    try {
      const memoriaData = await this.wikiService.parseSpecificMemoriaPage(memoria);

      const embed = new Discord.RichEmbed()
        .setAuthor(`${memoriaData.name}`, memoriaData.attImage)
        .setTitle('See it on the Wiki')
        .setURL(memoriaData.wikiLink)
        .setThumbnail(memoriaData.image);

      embed.addField('Usable By', memoriaData.usableBy, true);

      const hpatkdefString = memoriaData.hp.toLocaleString() + ' / ' + memoriaData.atk.toLocaleString() + ' / ' + memoriaData.def.toLocaleString();
      embed.addField('HP / ATK / DEF', hpatkdefString, true);

      embed.addField('Effects', memoriaData.effects.map((name) => {
        return `· ${name}`;
      }).join('\n'));

      this.presenceService.setPresence(memoriaData.name);

      message.channel.send(embed);

    } catch (e) {
      this.logger.error(e);
      message.channel.send('Sorry! I could not open that wiki page for some reason.');
    }

    return { };
  }
}
