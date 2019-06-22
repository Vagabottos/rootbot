
import { AutoWired, Singleton, Inject } from 'typescript-ioc';
import { BaseService } from '../base/BaseService';
import { EnvService } from './env';

@Singleton
@AutoWired
export class PresenceService extends BaseService {

  @Inject private envService: EnvService;

  public async init(client) {
    super.init(client);

    this.resetPresence();
  }

  public resetPresence() {
    this.setPresence('Magia Record ;help', false);
  }

  public setPresence(str: string, allowReset = true): void {
    if (this.envService.ignorePresence) { return; }

    this.client.user.setPresence({ game: { name: str } });

    if (allowReset) {
      setTimeout(() => {
        this.resetPresence();
      }, 15000);
    }
  }
}
