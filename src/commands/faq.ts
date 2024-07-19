import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { Inject } from "typescript-ioc";
import { ICommand } from "../interfaces";
import { CardService } from "../services/card";
import { PresenceService } from "../services/presence";

export class FAQCommand implements ICommand {
  @Inject private cardService: CardService;
  @Inject private presence: PresenceService;

  data = new SlashCommandBuilder()
    .setName("faq")
    .setDescription(
      "Retrieve card FAQ for any card in the Leder Games catalog."
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

    const faqData = this.cardService.getFAQsForCard(
      cardData.game,
      cardData.name
    );

    if (faqData.length === 0) {
      await interaction.reply(
        `"${cardData.name}" (${cardData.id}) has no FAQs.`
      );
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(cardData.name)
      .setURL(
        `https://cards.ledergames.com/faq?locale=en-US&productId=${cardData.game}#${cardData.id}`
      )
      .setDescription(
        faqData.map((e) => `**Q**: ${e.q}\n**A**: ${e.a}`).join("\n\n")
      )
      .setFooter({ text: cardData.id })
      .setThumbnail(cardData.image);

    await interaction.reply({ embeds: [embed] });

    this.presence.setPresence(`with ${cardData.name}`);
  }
}
