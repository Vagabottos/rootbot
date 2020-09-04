
import { Inject, AutoWired, Singleton } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { PresenceService } from '../services/presence';
import { OathCardService } from '../services/oath-card';

@Singleton
@AutoWired
export class OathCardCommand implements ICommand {

  help = 'Display an Oath card! Do `-ocard Pressgangs` to search for the Pressgangs card.';
  aliases = ['ocard'];

  @Inject private cardService: OathCardService;
  @Inject private presenceService: PresenceService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const card = this.cardService.getCard(args);
    if (!card) {
      message.channel.send(`Sorry! I could not find anything like "${args}"`);
      return;
    }

    const attachFiles = [
      `./content/oath/cards/${card.image}.png`
    ];

    this.presenceService.setPresence(`with ${card.name}`);

    message.channel.send({ files: attachFiles });

    return { };
  }

}
