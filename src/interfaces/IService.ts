
import * as Discord from 'discord.js';

export interface IService {
  init(client: Discord.Client): Promise<void>;
}
