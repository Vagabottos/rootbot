
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import * as Discord from 'discord.js';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { RulesService } from '../services/rules';

@Singleton
@AutoWired
export class RuleCommand implements ICommand {

  // tslint:disable-next-line
  help = 'Display a rule! Do `-rule 9.2.5.2` to search for that specific rule, `-rule satchel` to search for rules that include satchel, or `-rule vagabond satchel` to pull up that specific rule.';
  aliases = ['rule', 'rrule', 'rru', 'ru'];

  @Inject private rulesService: RulesService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const rule = this.rulesService.getRule(args);
    if (!rule) {
      message.channel.send(`Sorry! I could not find anything like "${args}"`);
      return;
    }

    message.channel.send({ embed: this.rulesService.createRuleEmbed(rule) });

    return { };
  }

}
