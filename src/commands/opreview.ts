
import { AutoWired, Singleton } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';

@Singleton
@AutoWired
export class OathVisionPreviewCommand implements ICommand {

  // tslint:disable-next-line
  help = 'Preview the result of an Oath game with oath.vision!';
  aliases = ['op', 'opreview', 'ovision'];

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    message.reply(`https://oath.vision/preview-chronicle/?seed=${encodeURIComponent(args)}`);

    return { };
  }

}
