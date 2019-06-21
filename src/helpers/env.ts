
import { AutoWired, Singleton } from 'typescript-ioc';
import { BaseHelper } from '../base/BaseHelper';

@Singleton
@AutoWired
export class EnvHelper extends BaseHelper {

  public get discordToken(): string {
    return process.env.DISCORD_TOKEN;
  }

  public get commandPrefix(): string {
    return process.env.COMMAND_PREFIX || '!';
  }

  public get ignorePresence(): boolean {
    return !!process.env.IGNORE_PRESENCE;
  }

}
