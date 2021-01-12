
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import * as DiscordMenu from 'discord.js-reaction-menu';

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

    const rules = this.rulesService.getRuleAndChildren(args);
    if (!rules) {
      message.channel.send(`Sorry! I could not find anything like "${args}"`);
      return;
    }

    if (rules.length === 1) {
      message.channel.send({ embed: this.rulesService.createRuleEmbed(rules[0]) });
    } else {
      const allRules = rules.slice(0, 9);

      const pages = allRules.map((x) => this.rulesService.createRuleEmbed(x));

      const reactions = { first: '⏪', back: '◀', next: '▶' };

      // tslint:disable-next-line
      new DiscordMenu.menu(message.channel, message.author.id, pages, 120000, reactions);
    }

    return { };
  }

}
