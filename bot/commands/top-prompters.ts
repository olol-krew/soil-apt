import { SlashCommandBuilder } from "discord.js";

import { BotCommand } from '../types'
import { formatBigNumber } from "../helpers/format-big-number";
import fetchApi from "../helpers/fetch-api";
import { TopUser } from "../../api/routes/prompts";

const topCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('Returns top SoilAPT users.'),
  async execute(interaction) {
    const tops = await fetchApi<TopUser[]>('/api/prompts/top-users')

    if (!tops || tops?.length === 0) {
      interaction.reply('Personne n\'a encore utilisé de prompt !')
      return
    }

    const reply: string[] = []
    const position = ['🥇', '🥈', '🥉']

    for (let i = 0; i < tops.length; i++) {
      reply.push(`${i < position.length ? position[i] : '😥'} **${tops[i].user}**: ${tops[i].promptCount} prompts (${formatBigNumber(tops[i].totalToken)} total tokens)`)
    }

    await interaction.reply('Les meilleurs potes de SoilAPT sont:\n' + reply.join('\n'))
  }
}

export default topCommand