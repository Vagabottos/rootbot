
import { Inject, AutoWired, Singleton } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { PresenceService } from '../services/presence';
import { FortCardService } from '../services/fort-card';

@Singleton
@AutoWired
export class FortCardCommand implements ICommand {

  help = 'Display a Fort card! Do `-fcard Baby Face` to search for the Baby Face card.';
  aliases = ['fcard'];

  @Inject private cardService: FortCardService;
  @Inject private presenceService: PresenceService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    const card = this.cardService.getCard(args);
    if (!card) {
      message.channel.send(`Sorry! I could not find anything like "${args}"`);
      return;
    }

    const attachFiles = [
      `./content/fort/cards/${card.image}.png`
    ];

    this.presenceService.setPresence(`with ${card.name}`);

    message.channel.send({ files: attachFiles });

    return { };
  }

}
