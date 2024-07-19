import { AutoWired, Singleton } from "typescript-ioc";
import { BaseService } from "../base/BaseService";

@Singleton
@AutoWired
export class PresenceService extends BaseService {
  public async init(client) {
    super.init(client);

    this.resetPresence();
  }

  public resetPresence() {
    this.setPresence("with Slash Commands!", false);
  }

  public setPresence(str: string, allowReset = true): void {
    this.client.user.setPresence({ activities: [{ name: str }] });

    if (allowReset) {
      setTimeout(() => {
        this.resetPresence();
      }, 15000);
    }
  }
}
