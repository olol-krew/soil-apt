import { SlashCommandBuilder } from "discord.js"

import { BotCommand } from '../types'
import { db } from "../data/database"

const moodCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName('persona')
    .setDescription('Get persona of the day'),
  async execute(interaction) {
    const potd = db.potd.getMostRecent()
    if (!potd) return
    const persona = db.persona.get(potd.personaId)
    if (!persona) return

    await interaction.reply(`Ma personnalité du jour est ${persona.title} (ajouté par ${persona.author}).`)
  }
}

export default moodCommand