
import { Inject, AutoWired, Singleton } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { HelpService } from '../services/help';
import { EnvService } from '../services/env';

@Singleton
@AutoWired
export class HelpCommand implements ICommand {

  help = 'Display this message!';
  aliases = ['help'];

  @Inject private envService: EnvService;
  @Inject private helpService: HelpService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message } = cmdArgs;
    message.author.send(`
**__All Commands__**

${this.helpService.allHelp.map(({ aliases, help }) => {
  return `${aliases.map((x) => `${this.envService.commandPrefix}${x}`).join(', ')}\n${help}\n`;
})
.join('\n')}`
    );

    return { resultString: 'helped' };
  }
}
