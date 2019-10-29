
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import * as Discord from 'discord.js';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { RulesService } from '../services/rules';
import { EmojiService } from '../services/emoji';

@Singleton
@AutoWired
export class RuleCommand implements ICommand {

  // tslint:disable-next-line
  help = 'Display a rule! Do `-rule 9.2.5.2` to search for that specific rule, `-rule satchel` to search for rules that include satchel, or `-rule vagabond satchel` to pull up that specific rule.';
  aliases = ['rule', 'ru'];

  @Inject private rulesService: RulesService;
  @Inject private emojiService: EmojiService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const rule = this.rulesService.getRule(args);
    if (!rule) {
      message.channel.send(`Sorry! I could not find anything like "${args}"`);
      return;
    }

    let text = this.fixText(rule.text || rule.pretext || rule.subtext || 'No subtext.');

    const embed = new Discord.RichEmbed()
      .setAuthor(`${rule.index} [${rule.parent}] ${rule.name}`)
      .setDescription(text)
      .setColor(rule.color);

    message.channel.send({ embed });

    return { };
  }

  private fixText(text: string) {

    let match = null;

    // replace nice faction icons
    // tslint:disable-next-line:no-conditional-assignment
    while (match = text.match(/`faction:([a-z]+):([0-9.]+)`/)) {
      const [replace, faction, rule] = match;

      const factEmoji = this.emojiService.getEmoji(`faction_${faction}`);
      text = text.replace(replace, `${factEmoji} (\`${rule}\`)`);
    }

    // replace nice item icons
    // tslint:disable-next-line:no-conditional-assignment
    while (match = text.match(/`item:([a-z]+)`/)) {
      const [replace, faction] = match;

      const itemEmoji = this.emojiService.getEmoji(`item_${faction}`);
      text = text.replace(replace, `${itemEmoji}`);
    }

    text = text.split('rule:').join('');

    return text;
  }

}
