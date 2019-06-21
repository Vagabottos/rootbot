
import * as Discord from 'discord.js';

import { IHelper } from '../interfaces';

export class BaseHelper implements IHelper {

  protected client: Discord.Client;

  async init(client: Discord.Client) {
    this.client = client;
  }
}
