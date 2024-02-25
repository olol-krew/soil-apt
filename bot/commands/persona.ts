import { SlashCommandBuilder } from "discord.js"

import type { BotCommand } from '../types'
import fetchApi from "../helpers/fetch-api"
import type { Persona } from "../../api/data/persona"

const moodCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName('persona')
    .setDescription('Get persona of the day'),
  async execute(interaction) {
    const persona = await fetchApi<Persona>('/api/personas/current')
    if (!persona) return

    await interaction.reply(`Ma personnalité du moment est ${persona.title} (ajouté par ${persona.author}).`)
  }
}

export default moodCommand