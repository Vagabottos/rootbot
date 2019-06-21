
import { AutoWired, Singleton } from 'typescript-ioc';
import { BaseService } from '../base/BaseService';

@Singleton
@AutoWired
export class EnvService extends BaseService {

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
