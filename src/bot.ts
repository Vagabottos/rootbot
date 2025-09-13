import * as Discord from "discord.js";
import { Inject } from "typescript-ioc";

import { ICommand, IService } from "./interfaces";

import { BaseService } from "./base/BaseService";
import { EmojiService } from "./services/emoji";
import { EnvService } from "./services/env";
import { Logger } from "./services/logger";
import { PresenceService } from "./services/presence";

import * as Commands from "./commands";
import { CardService } from "./services/card";
import { RulesService } from "./services/rules";

export class Bot {
  // these services have to be registered first
  @Inject private logger: Logger;
  @Inject private envService: EnvService;

  // these services can come in any particular order
  @Inject private cardService: CardService;
  @Inject private rulesService: RulesService;
  @Inject private emojiService: EmojiService;
  @Inject private presenceService: PresenceService;

  private commands = new Discord.Collection<string, ICommand>();

  public async init() {
    const DISCORD_TOKEN = this.envService.discordToken;
    if (!DISCORD_TOKEN) {
      throw new Error("No Discord token specified!");
    }

    const client = new Discord.Client({
      intents: [Discord.GatewayIntentBits.Guilds],
    });

    client.login(DISCORD_TOKEN);

    client.on(Discord.Events.ClientReady, () => {
      this.logger.log("Initialized bot!");

      // auto-register all services
      for (const key in this) {
        const service: IService = this[key] as unknown as IService;
        if (!(service instanceof BaseService)) {
          continue;
        }

        service.init(client);
      }
    });

    await this.createAndDeployCommands();

    client.on(Discord.Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      if (interaction.replied) return;

      const command = this.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      }
    });
  }

  private async createAndDeployCommands() {
    const commandList = [];

    Object.keys(Commands).forEach((commandName) => {
      const commandData = new Commands[commandName]();
      this.commands.set(commandData.data.name, commandData);

      commandList.push(commandData.data.toJSON());
    });

    const rest = new Discord.REST().setToken(this.envService.discordToken);
    this.logger.log(`Started refreshing application (/) commands.`);

    if (this.envService.discordServer) {
      this.logger.log("Registering specific guild commands.");
      await rest.put(
        Discord.Routes.applicationGuildCommands(
          this.envService.discordClient,
          this.envService.discordServer
        ),
        { body: commandList }
      );
    } else {
      this.logger.log("Registering global commands.");
      await rest.put(
        Discord.Routes.applicationCommands(this.envService.discordClient),
        { body: commandList }
      );
    }

    this.logger.log(`Successfully reloaded application (/) commands.`);
  }
}
