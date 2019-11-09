
import { Inject, AutoWired, Singleton } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';

@Singleton
@AutoWired
export class LeadersCommand implements ICommand {

  help = 'Display the custom leaderboard for the game reports from #after-game-reports!';
  aliases = ['leaders', 'leaderboard', 'games', 'scores'];

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message } = cmdArgs;

    message.reply(`https://wwleaders.seiyria.com/`);

    return { };
  }

}
