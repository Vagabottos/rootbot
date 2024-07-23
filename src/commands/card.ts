import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { Inject } from "typescript-ioc";
import { ICommand } from "../interfaces";
import { CardService } from "../services/card";
import { EmojiService } from "../services/emoji";
import { PresenceService } from "../services/presence";

export class CardCommand implements ICommand {
  @Inject private cardService: CardService;
  @Inject private emojiService: EmojiService;
  @Inject private presence: PresenceService;

  data = new SlashCommandBuilder()
    .setName("card")
    .setDescription(
      "Retrieve card data for any card in the Leder Games catalog."
    )
    .addStringOption((option) =>
      option
        .setName("cardname")
        .setDescription("The name of the card to search for.")
        .setRequired(true)
    );

  public async execute(interaction: CommandInteraction) {
    const cardName = interaction.options.get("cardname").value as string;
    const cardData = this.cardService.getCard(cardName);
    if (!cardData) {
      await interaction.reply(
        `Could not find a card with a name or id like "${cardName}".`
      );
      return;
    }

    const faqData = this.cardService.getFAQsForCard(
      cardData.game,
      cardData.name
    );
    const errataData = this.cardService.getErratasForCard(
      cardData.game,
      cardData.name
    );

    /*
    const realImage = path.basename(cardData.image, ".webp");

    const attachFiles = [
      new AttachmentBuilder(
        `./content/cards/images/${cardData.game}/en-US/${realImage}.png`
      ),
    ];
    */

    const embed = new EmbedBuilder()
      .setTitle(cardData.name)
      .setURL(`https://cards.ledergames.com/card/${cardData.id}`)
      .setDescription(this.formatTextForEmojis(cardData.text))
      .setFooter({
        text: `${cardData.id} - ${faqData.length} FAQ | ${errataData.length} Errata`,
      })
      .setThumbnail(cardData.image);

    await interaction.reply({ embeds: [embed] });

    this.presence.setPresence(`with ${cardData.name}`);
  }

  private formatTextForEmojis(text: string): string {
    text = text.split("`symbol:").join("<emoji>:symbol_").split("`").join("");

    const matches = text.match(/<emoji>:([a-zA-Z0-9_])+/g);
    if (!matches || !matches[0]) {
      return text;
    }

    matches.forEach((match) => {
      const [_, replace] = match.split(":");
      text = text.replace(match, this.emojiService.getEmoji(replace));
    });

    return text;
  }
}
