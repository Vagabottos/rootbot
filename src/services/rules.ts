
import { AutoWired, Singleton } from 'typescript-ioc';
import * as YAML from 'yamljs';
import * as FuzzySet from 'fuzzyset.js';
import axios from 'axios';

import { BaseService } from '../base/BaseService';
import { IRule } from '../interfaces';

@Singleton
@AutoWired
export class RulesService extends BaseService {

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
