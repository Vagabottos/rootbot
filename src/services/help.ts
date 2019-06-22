
import { AutoWired, Singleton } from 'typescript-ioc';
import { BaseService } from '../base/BaseService';

@Singleton
@AutoWired
export class HelpService extends BaseService {

  public get allHelp() {
    return this.helpTexts;
  }

  private helpTexts: Array<{ command: string, aliases: string[], help: string }> = [];

  public addHelp(help: { command: string, aliases: string[], help: string }) {
    this.helpTexts.push(help);
  }
}
