
import { Inject, AutoWired, Singleton } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';

@Singleton
@AutoWired
export class PostGameCommand implements ICommand {

  help = 'Get a link to the google sheet for data entry!';
  aliases = ['postgame'];

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message } = cmdArgs;

    // tslint:disable-next-line
    message.reply(`https://docs.google.com/spreadsheets/d/1yf1kZLdlWCSBdiROvzjIZt2Zay9ec7BzyIbdybI5NE4/edit?usp=sharing`);

    return { };
  }

}
