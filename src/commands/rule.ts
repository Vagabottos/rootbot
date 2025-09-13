import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { Inject } from "typescript-ioc";
import { ICommand } from "../interfaces";

import * as productList from "../../content/data/products.json";
import { RulesService } from "../services/rules";
const products = (productList as any).default || productList;

export class RuleCommand implements ICommand {
  @Inject private rulesService: RulesService;

  data = new SlashCommandBuilder()
    .setName("rule")
    .setDescription("Retrieve rules for any game in the Leder Games catalog.")
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("The game to get rules for.")
        .setRequired(true)
        .setChoices(products)
    )
    .addStringOption((option) =>
      option
        .setName("rule")
        .setDescription("The rule name or id to query")
        .setRequired(true)
    );

  public async execute(interaction: ChatInputCommandInteraction) {
    const game = interaction.options.get("game").value as string;
    const rule = interaction.options.get("rule").value as string;

    if (game === "root" && rule.startsWith("9.8")) {
      const embed = new EmbedBuilder()
        .setTitle(
          `9.8 [We understand the Vagabond is a dick, but...] Deal With It`
        )
        .setURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        .setDescription(this.rulesService.fixRuleText("Life isn't fair."));

      await interaction.reply({ embeds: [embed] });

      return;
    }

    const ruleData = this.rulesService.getRule(game, rule);
    if (!ruleData) {
      await interaction.reply(
        `Could not find a rule in "${game}" for query "${rule}".`
      );
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(this.rulesService.formatTitle(ruleData))
      .setURL(this.rulesService.getRuleURL(game, ruleData))
      .setDescription(
        this.rulesService.fixRuleText(
          ruleData.text || ruleData.pretext || ruleData.subtext || "No subtext."
        )
      );

    await interaction.reply({ embeds: [embed] });
  }
}
