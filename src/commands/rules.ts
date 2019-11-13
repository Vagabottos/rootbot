
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import * as Discord from 'discord.js';
import * as DiscordMenu from 'discord.js-reaction-menu';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { RulesService } from '../services/rules';

@Singleton
@AutoWired
export class RulesCommand implements ICommand {

  help = 'Search the rules! Do `-rules Dominance` to search for all rules related to dominance';
  aliases = ['rules', 'rs'];

  @Inject private rulesService: RulesService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const rules = this.rulesService.getRules(args);
    if (!rules.length) {
      message.channel.send(`Sorry! I could not find anything like "${args}"`);
      return;
    }

    const allRules = rules.slice(0, 9);

    const index = new Discord.RichEmbed()
      .setTitle(`Search results for '${args}'`)
      .setDescription(allRules.map((x, i) => `\`Result #${i + 1}\`: [${this.rulesService.formatTitle(x)}](${this.rulesService.getRuleURL(x)})`));

    const pages = allRules.map((x) => this.rulesService.createRuleEmbed(x));

    const reactions = { first: '⏪', back: '◀', next: '▶' };

    // tslint:disable-next-line
    new DiscordMenu.menu(message.channel, message.author.id, [index, ...pages], 120000, reactions);

    // message.channel.send({ embed: this.rulesService.createRuleEmbed(rule) });

    return { };
  }

}
