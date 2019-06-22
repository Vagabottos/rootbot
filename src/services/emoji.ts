
import * as Discord from 'discord.js';

import { AutoWired, Singleton } from 'typescript-ioc';
import { BaseService } from '../base/BaseService';

@Singleton
@AutoWired
export class EmojiService extends BaseService {

  private emojiHash: { [key: string]: string } = {};
  private emojiInstanceHash: { [key: string]: Discord.Emoji } = {};

  public async init(client) {
    super.init(client);

    this.loadEmojis();
  }

  public getEmoji(name: string) {
    return this.emojiHash[name];
  }

  public getEmojiInstance(name: string) {
    return this.emojiInstanceHash[name];
  }

  private loadEmojis() {
    this.client.emojis.forEach((emoji) => {
      this.emojiHash[emoji.name] = emoji.toString();
      this.emojiInstanceHash[emoji.name] = emoji;
    });
  }

}
