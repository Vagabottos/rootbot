
import * as Discord from 'discord.js';

export interface IHelper {
  init(client: Discord.Client): Promise<void>;
}
