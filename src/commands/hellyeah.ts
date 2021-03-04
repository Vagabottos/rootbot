
import { Inject, AutoWired, Singleton } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';

@Singleton
@AutoWired
export class HellYeahCommand implements ICommand {

  help = 'Hell yeah!';
  aliases = ['hellyeah'];

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message } = cmdArgs;

    // tslint:disable-next-line
    message.reply(`Hell yeah! Do it!`);

    return { };
  }

}
