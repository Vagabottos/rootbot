
import { Inject, AutoWired, Singleton } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';

@Singleton
@AutoWired
export class RootCardsCommand implements ICommand {

  help = 'Display the link to all of the cards in Root!';
  aliases = ['rootcards'];

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message } = cmdArgs;

    message.reply(`https://rootcards.seiyria.com/`);

    return { };
  }

}
