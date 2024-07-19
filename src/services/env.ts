import { AutoWired, Singleton } from "typescript-ioc";
import { BaseService } from "../base/BaseService";

@Singleton
@AutoWired
export class EnvService extends BaseService {
  public get discordToken(): string {
    return process.env.DISCORD_TOKEN;
  }

  public get discordClient(): string {
    return process.env.DISCORD_CLIENT_ID;
  }

  public get discordServer(): string {
    return process.env.DISCORD_SERVER_ID;
  }

  public get commandPrefix(): string {
    return process.env.COMMAND_PREFIX || "-";
  }
}
