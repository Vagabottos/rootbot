import { OathGame, parseOathTTSSavefileString } from "@seiyria/oath-parser";
import * as Discord from "discord.js";

import { ICommand } from "../interfaces";

export class OathVisionPreviewCommand implements ICommand {
  data = new Discord.SlashCommandBuilder()
    .setName("op")
    .setDescription(
      "Preview the result of an Oath game, and link to oath.vision for easy recording."
    )
    .addStringOption((option) =>
      option
        .setName("seed")
        .setDescription("The seed to parse.")
        .setRequired(true)
    );

  public async execute(interaction: Discord.CommandInteraction) {
    const seed = interaction.options.get("seed").value as string;

    let parsedGame: OathGame = {};
    try {
      parsedGame = parseOathTTSSavefileString(seed);
    } catch {
      await interaction.reply("Your TTS seed string is invalid.");
      return;
    }

    const embed = new Discord.EmbedBuilder();

    embed
      .setAuthor({ name: parsedGame.chronicleName })
      .setColor(0x99629a)
      .setTitle("Enter this chronicle on oath.vision!")
      .setURL(
        `https://oath.vision/preview-chronicle/?seed=${encodeURIComponent(
          seed
        )}`
      );

    embed.addFields([
      { name: "Tale", value: `#${parsedGame.gameCount}`, inline: true },
      { name: "Oath", value: `${parsedGame.oath}`, inline: true },
    ]);

    await interaction.reply({ embeds: [embed] });
  }
}
