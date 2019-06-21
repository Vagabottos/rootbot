
import * as Discord from 'discord.js';
import { AutoWired, Singleton } from 'typescript-ioc';

import { ICommandResult, ICommand } from '../interfaces';
import { BaseService } from '../base/BaseService';

import * as Commands from '../commands';

@Singleton
@AutoWired
export class CommandParser extends BaseService {

  private executableCommands: { [key: string]: ICommand } = {};

  private messageCommands: ICommand[] = [];
  private emojiAddCommands: ICommand[] = [];
  private emojiRemoveCommands: ICommand[] = [];

  public async init(client) {
    super.init(client);

    this.loadCommands(Commands);
  }

  // used to parse strings. any command registering this will be listening to all incoming messages.
  // this function returns nothing because it can operate on multiple values
  handleMessage(message: Discord.Message): void {
    this.messageCommands.forEach((cmd) => cmd.onMessage(message));
  }

  // any command registering this will fire their callback when a reaction is added to a message
  // this function returns nothing because it can operate on multiple values
  handleEmojiAdd(reaction: Discord.MessageReaction, user: Discord.User) {
    this.emojiAddCommands.forEach((cmd) => cmd.onEmojiAdd(reaction, user));
  }

  // any command registering this will fire their callback when a reaction is removed from a message
  // this function returns nothing because it can operate on multiple values
  handleEmojiRemove(reaction: Discord.MessageReaction, user: Discord.User) {
    this.emojiRemoveCommands.forEach((cmd) => cmd.onEmojiRemove(reaction, user));
  }

  // used to handle commands. each command can register a set of aliases that fire off a callback.
  // no alias overlapping is allowed
  async handleCommand(message: Discord.Message): Promise<ICommandResult> {
    const cmd = message.content.split(' ')[0].substring(1);
    const args = message.content.substring(message.content.indexOf(cmd) + cmd.length + 1);

    const cmdInst = this.executableCommands[cmd];
    if (!cmdInst) { return; }

    return cmdInst.execute({
      debug: false,
      args,
      message,
      user: message.author
    });
  }

  private loadCommands(commands) {
    Object.keys(commands).forEach((cmdName) => {
      const cmdInst = new Commands[cmdName]();

      this.registerCommand(cmdInst);
    });
  }

  private registerCommand(cmdInst: ICommand) {
    if (cmdInst.aliases) {
      cmdInst.aliases.forEach((alias) => {
        if (this.executableCommands[alias]) {
          throw new Error(
            `Cannot re-register alias "${alias}". Trying to register ${cmdInst} but already registered ${this.executableCommands[alias]}.`
          );
        }

        if (!cmdInst.execute) { throw new Error(`Command "${alias}" does not have an execute function.`); } 
        this.executableCommands[alias] = cmdInst;
      });
    }

    if (cmdInst.onMessage) {
      this.messageCommands.push(cmdInst);
    }

    if (cmdInst.onEmojiAdd) {
      this.emojiAddCommands.push(cmdInst);
    }

    if (cmdInst.onEmojiRemove) {
      this.emojiRemoveCommands.push(cmdInst);
    }
  }
}
