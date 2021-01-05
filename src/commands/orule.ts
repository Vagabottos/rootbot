
import { Inject, AutoWired, Singleton } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { OathRulesService } from '../services/oath-rules';

@Singleton
@AutoWired
export class OathRuleCommand implements ICommand {

  // tslint:disable-next-line
  help = 'Display an Oath rule! Do `-orule 5.5.5` to search for that specific rule, `-rule Reliquary` to search for rules that include satchel, or `-rule imperial reliquary board` to pull up that specific rule.';
  aliases = ['orule', 'oru'];

  @Inject private oathRulesService: OathRulesService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const rule = this.oathRulesService.getRule(args);
    if (!rule) {
      message.channel.send(`Sorry! I could not find anything like "${args}"`);
      return;
    }

    message.channel.send({ embed: this.oathRulesService.createRuleEmbed(rule) });

    return { };
  }

}
