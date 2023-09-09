import { SlashCommandBuilder } from "discord.js";

import { BotCommand } from '../types'
import { formatBigNumber } from "../helpers/format-big-number";
import { db } from "../data/database";

const topCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('Returns top SoilAPT users.'),
  async execute(interaction) {
    const users = db.user.getAll()
    const aggregatedPrompts = db.prompt.countPerUser()

    const topUsers = aggregatedPrompts.map(count => {
      return {
        user: users.find(u => u.id === count.userId)?.name,
        ...count,
        totalToken: count.inputTokenCount + count.outputTokenCount
      }
    })

    const reply: string[] = []
    let position = ['🥇', '🥈', '🥉']

    for (let i = 0; i < topUsers.length; i++) {
      reply.push(`${i < position.length ? position[i] : '😥'} **${topUsers[i].user}**: ${topUsers[i].promptCount} prompts (${formatBigNumber(topUsers[i].totalToken)} total tokens)`)
    }

    await interaction.reply('Les meilleurs potes de SoilAPT sont:\n' + reply.join('\n'))
  }
}

export default topCommand