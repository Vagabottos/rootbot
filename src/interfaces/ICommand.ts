import * as Discord from "discord.js";

export interface ICommandResult {
  resultString?: string;
  result?: any;
}

export interface ICommandArgs {
  debug?: boolean;
  args: string;
  message?: Discord.Message;
  user?: Discord.User;
}

// commands are created once, and then run multiple times as needed.
export interface ICommand {
  data: Discord.SlashCommandOptionsOnlyBuilder;
  execute: (interaction: Discord.CommandInteraction) => void;
}
