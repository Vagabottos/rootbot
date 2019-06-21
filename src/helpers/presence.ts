
import { AutoWired, Singleton, Inject } from 'typescript-ioc';
import { BaseHelper } from '../base/BaseHelper';
import { EnvHelper } from './env';

@Singleton
@AutoWired
export class PresenceHelper extends BaseHelper {

  @Inject private envHelper: EnvHelper;

  public async init(client) {
    super.init(client);

    if (this.envHelper.ignorePresence) { return; }
    client.user.setPresence({ game: { name: 'Magia Record ;help' } });
  }
}
