import {
  AttachmentBuilder,
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import * as path from "path";
import { Inject } from "typescript-ioc";
import { ICommand } from "../interfaces";
import { CardService } from "../services/card";
import { PresenceService } from "../services/presence";

export class ErrataCommand implements ICommand {
  @Inject private cardService: CardService;
  @Inject private presence: PresenceService;

  data = new SlashCommandBuilder()
    .setName("errata")
    .setDescription(
      "Retrieve card errata for any card in the Leder Games catalog."
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
        `Could not find a card with a name like "${cardName}".`
      );
      return;
    }

    const errataData = this.cardService.getErratasForCard(
      cardData.game,
      cardData.name
    );

    if (errataData.length === 0) {
      await interaction.reply(
        `"${cardData.name}" (${cardData.id}) has no errata.`
      );
      return;
    }

    const realImage = path.basename(cardData.image, ".webp");

    const attachFiles = [
      new AttachmentBuilder(
        `./content/cards/images/${cardData.game}/en-US/${realImage}.png`
      ),
    ];

    const embed = new EmbedBuilder()
      .setTitle(cardData.name)
      .setURL(
        `https://cards.ledergames.com/errata?locale=en-US&productId=${cardData.game}#${cardData.id}`
      )
      .setDescription(errataData.map((e) => `- ${e.text}`).join("\n"))
      .setFooter({ text: cardData.id })
      .setThumbnail(`attachment://${realImage}.png`);

    await interaction.reply({ embeds: [embed], files: attachFiles });

    this.presence.setPresence(`with ${cardData.name}`);
  }
}
