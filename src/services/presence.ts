
import { AutoWired, Singleton, Inject } from 'typescript-ioc';
import { BaseService } from '../base/BaseService';
import { EnvService } from './env';

@Singleton
@AutoWired
export class PresenceService extends BaseService {

  public async init(client) {
    super.init(client);

    this.resetPresence();
  }

  public resetPresence() {
    this.setPresence('Root -rhelp', false);
  }

  public setPresence(str: string, allowReset = true): void {
    this.client.user.setPresence({ activity: { name: str } });

    if (allowReset) {
      setTimeout(() => {
        this.resetPresence();
      }, 15000);
    }
  }
}
