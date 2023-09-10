import { SlashCommandBuilder } from "discord.js";

import { BotCommand } from '../types'
import { db } from "../data/database";
import { formatBigNumber, formatDollarAmount } from "../helpers/format-big-number";

const INPUT_TOKEN_PRICE_PER_THOUSAND = 0.0015;
const OUTPUT_TOKEN_PRICE_PER_THOUSAND = 0.002;
const MISSED_AMOUNT_FROM_DATA = 0.43

const usageCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName('usage')
    .setDescription('Returns API usage stats.'),
  async execute(interaction) {
    const usageCounts = db.prompt.countUsageTokens()

    if (
      null === usageCounts ||
      undefined === usageCounts?.outputTokenCount ||
      undefined === usageCounts?.inputTokenCount ||
      undefined === usageCounts?.promptCount
    ) {
      await interaction.reply(`Désolé, il y a eu un problème avec la requête, contactez Nico.`)
      return;
    }

    const inputPrice = INPUT_TOKEN_PRICE_PER_THOUSAND * (usageCounts?.inputTokenCount / 1000);
    const outputPrice = OUTPUT_TOKEN_PRICE_PER_THOUSAND * (usageCounts?.outputTokenCount / 1000);
    const reply: string[] = []

    reply.push(`- ${formatBigNumber(usageCounts?.promptCount)} prompts envoyés`)
    reply.push(`- ${formatBigNumber(usageCounts?.inputTokenCount)} input tokens comptabilisés, soit ${formatDollarAmount(inputPrice)}`)
    reply.push(`- ${formatBigNumber(usageCounts?.outputTokenCount)} output tokens comptabilisés, soit ${formatDollarAmount(outputPrice)}`)
    reply.push(`Soit un total de ${formatDollarAmount(inputPrice + outputPrice + MISSED_AMOUNT_FROM_DATA)} (en ajoutant les manqués)`)

    await interaction.reply('Les statistiques API du bot sont :\n' + reply.join('\n'))
  }
}

export default usageCommand
