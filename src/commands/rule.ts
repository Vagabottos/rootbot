
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import * as Discord from 'discord.js';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { RulesService } from '../services/rules';

@Singleton
@AutoWired
export class RuleCommand implements ICommand {

  help = 'Display a rule!';
  aliases = ['rule', 'r'];

  @Inject private rulesService: RulesService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const rule = this.rulesService.getRule(args);
    if (!rule) {
      message.channel.send(`Sorry! I could not find anything like "${args}"`);
      return;
    }

    console.log(rule);

    const embed = new Discord.RichEmbed()
      .setAuthor(`${rule.index} [${rule.parent}] ${rule.name}`)
      .setDescription(rule.text || rule.pretext || rule.subtext || 'No subtext.')
      .setColor(rule.color);

    message.channel.send({ embed });

    return { };
  }

}
