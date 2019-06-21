
import * as Discord from 'discord.js';
import { Inject } from 'typescript-ioc';

import { ICommandResult } from './interfaces';

import { Logger } from './helpers/logger';
import { CommandParser } from './helpers/command-parser';
import { PresenceHelper } from './helpers/presence';
import { EnvHelper } from './helpers/env';
import { DatabaseHelper } from './helpers/database';

export class Bot {
  @Inject private logger: Logger;
  @Inject private envHelper: EnvHelper;
  @Inject private databaseHelper: DatabaseHelper;
  @Inject private presenceHelper: PresenceHelper;
  @Inject private commandParser: CommandParser;

  public async init() {
    const DISCORD_TOKEN = this.envHelper.discordToken;
    const COMMAND_PREFIX = this.envHelper.commandPrefix;
    if (!DISCORD_TOKEN) { throw new Error('No Discord token specified!'); }

    const client = new Discord.Client();
    client.login(DISCORD_TOKEN);

    client.on('ready', () => {
      this.logger.log('Initialized bot!');

      this.envHelper.init(client);
      this.databaseHelper.init(client);
      this.presenceHelper.init(client);
      this.commandParser.init(client);
    });

    client.on('message', async (msg) => {
      if (msg.author.bot || msg.author.id === client.user.id) { return; }

      const content = msg.content;

      if (content.startsWith(COMMAND_PREFIX)) {
        const result: ICommandResult = await this.commandParser.handleCommand(msg);
        this.logger.logCommandResult(result);

      } else {
        this.commandParser.handleMessage(msg);

      }
    });

    client.on('messageReactionAdd', async (reaction, user) => {
      if (user.bot) { return; }

      this.commandParser.handleEmojiAdd(reaction, user);
    });

    client.on('messageReactionRemove', async (reaction, user) => {
      if (user.bot) { return; }

      this.commandParser.handleEmojiRemove(reaction, user);
    });
  }
}
