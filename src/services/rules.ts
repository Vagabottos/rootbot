import * as fs from "fs-extra";
import * as FuzzySet from "fuzzyset.js";
import { AutoWired, Inject, Singleton } from "typescript-ioc";

import { BaseService } from "../base/BaseService";
import { IRule } from "../interfaces";
import { EmojiService } from "./emoji";

import slugify from "slugify";
import * as productList from "../../content/data/products.json";
const products = (productList as any).default || productList;

@Singleton
@AutoWired
export class RulesService extends BaseService {
  @Inject private emojiService: EmojiService;

  private rulesHash: Record<string, Record<string, IRule>> = {};
  private ruleSets: Record<string, FuzzySet> = {};

  public async init(client) {
    super.init(client);

    products.forEach((product) => {
      this.rulesHash[product.value] = {};
      this.ruleSets[product.value] = new FuzzySet();

      this.loadRules(product.value);
    });
  }

  public getRuleAndChildren(game: string, name: string): IRule[] {
    const primaryRule = this.getRule(game, name);

    if (!primaryRule) {
      return [];
    }

    return [
      primaryRule,
      ...(primaryRule.children || primaryRule.subchildren || []),
    ];
  }

  public getRule(game: string, name: string): IRule {
    const res = this.ruleSets[game].get(name);
    if (!res) {
      return null;
    }

    return this.rulesHash[game][res[0][1]];
  }

  public getRules(game: string, name: string): IRule[] {
    const res = this.ruleSets[game].get(name, "", 0.5);
    if (!res) {
      return [];
    }

    return res.map((x) => this.rulesHash[x[1]]);
  }

  public fixRuleText(text: string) {
    let match = null;

    // replace nice faction icons
    // tslint:disable-next-line:no-conditional-assignment
    while ((match = text.match(/`faction:([a-z]+):([0-9.]+)`/))) {
      const [replace, faction, rule] = match;

      const factEmoji = this.emojiService.getEmoji(`faction_${faction}`);
      text = text.replace(replace, `${factEmoji} (\`${rule}\`)`);
    }

    // replace nice item icons
    // tslint:disable-next-line:no-conditional-assignment
    while ((match = text.match(/`item:([a-z]+)`/))) {
      const [replace, faction] = match;

      const itemEmoji = this.emojiService.getEmoji(`item_${faction}`);
      text = text.replace(replace, `${itemEmoji}`);
    }

    text = text.split("rule:").join("");

    return text;
  }

  public slugTitle(index: string, title: string): string {
    const baseString = `${index}-${slugify(title?.toLowerCase())}`
      .split('"')
      .join("");
    if (baseString.match(/^.+(\.)$/)) {
      return baseString.substring(0, baseString.length - 1);
    }
    return baseString;
  }

  public formatTitle(rule: IRule): string {
    return `${rule.index} [${rule.parent}] ${rule.name}`;
  }

  public getRuleURL(game: string, rule: IRule): string {
    return `https://${game}.seiyria.com/#${this.slugTitle(
      rule.index,
      rule.name
    )}`;
  }

  private async loadRules(game: string) {
    const rules = fs.readJsonSync(`./content/rules/${game}.json`);

    const recurse = (rule, curIdx, { parent, color }) => {
      const children = rule.children || rule.subchildren;

      if (children) {
        children.forEach((child, idx) =>
          recurse(child, `${curIdx}.${idx + 1}`, { parent, color })
        );
      }

      this.ruleSets[game].add(`${parent} ${rule.name}`);
      this.ruleSets[game].add(`${rule.name}`);
      this.ruleSets[game].add(curIdx);

      rule.parent = parent;
      rule.color = color;
      rule.index = curIdx;

      this.rulesHash[game][`${parent} ${rule.name}`] = rule;
      this.rulesHash[game][`${rule.name}`] = rule;
      this.rulesHash[game][curIdx] = rule;
    };

    rules.forEach((rule, index) =>
      recurse(rule, `${index + 1}`, { parent: rule.name, color: rule.color })
    );
  }
}
