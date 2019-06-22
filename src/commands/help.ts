
import { Inject, AutoWired, Singleton } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { HelpService } from '../services/help';

@Singleton
@AutoWired
export class HelpCommand implements ICommand {

  help = 'Display this message!';
  aliases = ['help'];

  @Inject private helpService: HelpService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message } = cmdArgs;
    message.author.send(`
**__All Commands__**

${this.helpService.allHelp.map(({ aliases, help }) => {
  return `${aliases.join(', ')}\n${help}\n`;
})
.join('\n')}`
    );

    return { resultString: 'helped' };
  }
}
