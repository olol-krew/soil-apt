import { SlashCommandBuilder } from "discord.js";

import { BotCommand } from '../types'
import { prisma } from '../prisma/prisma';
import { formatBigNumber } from "../helpers/format-big-number";

const topCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('Returns top SoilAPT users.'),
  async execute(interaction) {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { Prompt: true }
        }
      }
    })

    const aggreg = await prisma.prompt.groupBy({
      by: ['userId'],
      _sum: {
        outputToken: true,
        inputToken: true
      }
    })

    const topUsers = users
      .map(u => {
        const sum = aggreg.find(a => a.userId == u.id)._sum
        return {
          ...u,
          ...sum,
          totalToken: sum.outputToken + sum.inputToken
        }
      })
      .sort((a, b) => {
        if (a._count.Prompt > b._count.Prompt) {
          return -1
        } else if (a._count.Prompt < b._count.Prompt) {
          return 1
        }

        return 0
      })

    const reply = []
    let position = ['🥇', '🥈', '🥉']

    for (let i = 0; i < topUsers.length; i++) {
      if (i > 10) break
      reply.push(`${i < position.length ? position[i] : '😥'} **${topUsers[i].name}**: ${topUsers[i]._count.Prompt} prompts (${formatBigNumber(topUsers[i].totalToken)} total tokens)`)
    }

    await interaction.reply('Les meilleurs potes de SoilAPT sont:\n' + reply.join('\n'))
  }
}

export default topCommand