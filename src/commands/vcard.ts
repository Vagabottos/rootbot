
import { Inject, AutoWired, Singleton } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { PresenceService } from '../services/presence';
import { VastCardService } from '../services/vast-card';

@Singleton
@AutoWired
export class VastCardCommand implements ICommand {

  help = 'Display a Vast card! Do `-vcard Lava Tube` to search for the Lava Tube card.';
  aliases = ['vcard'];

  @Inject private cardService: VastCardService;
  @Inject private presenceService: PresenceService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const card = this.cardService.getCard(args);
    if (!card) {
      message.channel.send(`Sorry! I could not find anything like "${args}"`);
      return;
    }

    const attachFiles = [
      `./content/vast/cards/${card.image}.png`
    ];

    this.presenceService.setPresence(`with ${card.name}`);

    message.channel.send({ files: attachFiles });

    return { };
  }

}
