
import * as Discord from 'discord.js';

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
  aliases: string[];

  // run when the aliases are matched, and if the function is added to the command
  execute?(args: ICommandArgs): Promise<ICommandResult>;

  // run when a message happens, if the function is added to the command
  onMessage?(message: Discord.Message);

  // run when an emoji is added to a message, if the function is added to the command
  onEmojiAdd?(reaction: Discord.MessageReaction, user: Discord.User);

  // run when an emoji is removed from a message, if the function is added to the command
  onEmojiRemove?(reaction: Discord.MessageReaction, user: Discord.User);
}
