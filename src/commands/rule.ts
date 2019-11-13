
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import * as Discord from 'discord.js';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { RulesService } from '../services/rules';

@Singleton
@AutoWired
export class RuleCommand implements ICommand {

  // tslint:disable-next-line
  help = 'Display a rule! Do `-rule 9.2.5.2` to search for that specific rule, `-rule satchel` to search for rules that include satchel, or `-rule vagabond satchel` to pull up that specific rule.';
  aliases = ['rule', 'ru'];

  @Inject private rulesService: RulesService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const rule = this.rulesService.getRule(args);
    if (!rule) {
      message.channel.send(`Sorry! I could not find anything like "${args}"`);
      return;
    }

    let text = this.rulesService.fixRuleText(rule.text || rule.pretext || rule.subtext || 'No subtext.');

    const embed = new Discord.RichEmbed()
      .setTitle(`${rule.index} [${rule.parent}] ${rule.name}`)
      .setURL(`https://root.seiyria.com/#${this.rulesService.slugTitle(rule.index, rule.name)}`)
      .setDescription(text)
      .setColor(rule.color);

    message.channel.send({ embed });

    return { };
  }

}
