
import { AutoWired, Singleton } from 'typescript-ioc';
import * as Discord from 'discord.js';
import { parseOathTTSSavefileString, OathGame } from '@seiyria/oath-parser';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';

@Singleton
@AutoWired
export class OathVisionPreviewCommand implements ICommand {

  // tslint:disable-next-line
  help = 'Preview the result of an Oath game with oath.vision!';
  aliases = ['op', 'opreview', 'ovision'];

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    cmdArgs.args = cmdArgs.args.trim();

    const { message, args } = cmdArgs;

    if (!args) {
      message.reply('You need to give me your TTS seed string.');
      return { };
    }

    let parsedGame: OathGame = {};
    try {
      parsedGame = parseOathTTSSavefileString(args);
    } catch {
      message.reply('Your TTS seed string is invalid.');
      return { };
    }

    const embed = new Discord.MessageEmbed();

    embed
      .setAuthor(parsedGame.chronicleName)
      .setColor(0x99629a)
      .setTitle('Enter this chronicle on oath.vision!')
      .setURL(`https://oath.vision/preview-chronicle/?seed=${encodeURIComponent(args)}`);

    embed.addField('Tale', `#${parsedGame.gameCount}`, true);
    embed.addField('Oath', `${parsedGame.oath}`, true);

    message.channel.send({ embed });

    return { };
  }

}
