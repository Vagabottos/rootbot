
import * as Discord from 'discord.js';
import { Inject } from 'typescript-ioc';

import { ICommandResult, IService } from './interfaces';

import { Logger } from './services/logger';
import { CommandParser } from './services/command-parser';
import { CardService } from './services/card';
import { PresenceService } from './services/presence';
import { EnvService } from './services/env';
import { EmojiService } from './services/emoji';
import { BaseService } from './base/BaseService';

export class Bot {
  // these services have to be registered first
  @Inject private logger: Logger;
  @Inject private envService: EnvService;

  // these services can come in any particular order
  @Inject private cardService: CardService;
  @Inject private emojiService: EmojiService;
  @Inject private presenceService: PresenceService;

  // this service should come last
  @Inject private commandParser: CommandParser;

  public async init() {
    const DISCORD_TOKEN = this.envService.discordToken;
    const COMMAND_PREFIX = this.envService.commandPrefix;
    if (!DISCORD_TOKEN) { throw new Error('No Discord token specified!'); }

    const client = new Discord.Client();
    client.login(DISCORD_TOKEN);

    client.on('ready', () => {
      this.logger.log('Initialized bot!');

      // auto-register all services
      for (const key in this) {
        const service: IService = (this[key] as unknown) as IService;
        if (!(service instanceof BaseService)) { continue; }

        service.init(client);
      }
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
