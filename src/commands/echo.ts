import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';

export class EchoCommand implements ICommand {

  static help = 'Echo your message right back at\'cha!';

  aliases = ['echo'];

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;
    message.reply(args);

    return { resultString: args };
  }
}
