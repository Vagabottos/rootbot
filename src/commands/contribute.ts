
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import * as Discord from 'discord.js';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';

@Singleton
@AutoWired
export class ContributeCommand implements ICommand {

  help = 'Display the contributor information!';
  aliases = ['contribute'];

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message } = cmdArgs;

    // tslint:disable-next-line
    message.reply(`head on over to https://github.com/seiyria/root/blob/master/README.md#want-to-contribute-rulesfaq to find where the files are located and contribute!`);

    return { };
  }

}
