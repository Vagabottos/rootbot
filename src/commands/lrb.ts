
import { Inject, AutoWired, Singleton } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';

@Singleton
@AutoWired
export class LRBCommand implements ICommand {

  help = 'Get a quick link to the non-official Living Rulebook!';
  aliases = ['lrb'];

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message } = cmdArgs;

    // tslint:disable-next-line
    message.reply(`https://root.seiyria.com`);

    return { };
  }

}
