
import * as Discord from 'discord.js';
import { Inject } from 'typescript-ioc';

import { ICommandResult } from './interfaces';

import { Logger } from './services/logger';
import { CommandParser } from './services/command-parser';
import { PresenceService } from './services/presence';
import { EnvService } from './services/env';
import { DatabaseService } from './services/database';
import { WikiService } from './services/wiki';
import { EmojiService } from './services/emoji';

export class Bot {
  @Inject private logger: Logger;
  @Inject private envService: EnvService;
  @Inject private emojiService: EmojiService;
  @Inject private databaseService: DatabaseService;
  @Inject private presenceService: PresenceService;
  @Inject private wikiService: WikiService;
  @Inject private commandParser: CommandParser;

  public async init() {
    const DISCORD_TOKEN = this.envService.discordToken;
    const COMMAND_PREFIX = this.envService.commandPrefix;
    if (!DISCORD_TOKEN) { throw new Error('No Discord token specified!'); }

    const client = new Discord.Client();
    client.login(DISCORD_TOKEN);

    client.on('ready', () => {
      this.logger.log('Initialized bot!');

      [
        this.envService, this.databaseService, this.presenceService,
        this.emojiService, this.wikiService, this.commandParser
      ].forEach((service) => service.init(client));
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
