
import { AutoWired, Singleton, Inject } from 'typescript-ioc';
import * as Discord from 'discord.js';
import * as FuzzySet from 'fuzzyset.js';
import slugify from 'slugify';
import axios from 'axios';

import { BaseService } from '../base/BaseService';
import { IRule } from '../interfaces';
import { EmojiService } from './emoji';

@Singleton
@AutoWired
export class RulesService extends BaseService {

  @Inject private emojiService: EmojiService;

  private rulesHash: { [key: string]: IRule } = {};
  private set: FuzzySet = new FuzzySet();

  public async init(client) {
    super.init(client);

    this.loadRules();
  }

  public getRule(name: string): IRule {
    const res = this.set.get(name);
    if (!res) { return null; }

    return this.rulesHash[res[0][1]];
  }

  public getRules(name: string): IRule[] {
    const res = this.set.get(name, '', 0.5);
    if (!res) { return []; }

    return res.map((x) => this.rulesHash[x[1]]);
  }

  public fixRuleText(text: string) {

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

  public slugTitle(index: string, title: string): string {
    const baseString = `${index}-${slugify(title.toLowerCase())}`.split('"').join('');
    if (baseString.match(/^.+(\.)$/)) { return baseString.substring(0, baseString.length - 1); }
    return baseString;
  }

  public formatTitle(rule: IRule): string {
    return `${rule.index} [${rule.parent}] ${rule.name}`;
  }

  public getRuleURL(rule: IRule): string {
    return `https://root.seiyria.com/#${this.slugTitle(rule.index, rule.name)}`;
  }

  public createRuleEmbed(rule: IRule): Discord.RichEmbed {
    return new Discord.RichEmbed()
      .setTitle(this.formatTitle(rule))
      .setURL(this.getRuleURL(rule))
      .setDescription(this.fixRuleText(rule.text || rule.pretext || rule.subtext || 'No subtext.'))
      .setColor(rule.color);
  }

  private async loadRules() {

    const rules: any[] = (await axios.get('https://root.seiyria.com/assets/rules.json')).data;

    const recurse = (rule, curIdx, { parent, color }) => {
      const children = rule.children || rule.subchildren;

      if (children) {
        children.forEach((child, idx) => recurse(child, `${curIdx}.${idx + 1}`, { parent, color }));
      }

      this.set.add(`${parent} ${rule.name}`);
      this.set.add(rule.name);
      this.set.add(curIdx);

      rule.parent = parent;
      rule.color = color;
      rule.index = curIdx;

      this.rulesHash[`${parent} ${rule.name}`] = rule;
      this.rulesHash[rule.name] = rule;
      this.rulesHash[curIdx] = rule;
    };

    rules.forEach((rule, index) => recurse(rule, `${index + 1}`, { parent: rule.name, color: rule.color }));
  }

}
