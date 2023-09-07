import { BotCommand } from '../types.js'
import { SlashCommandBuilder } from "discord.js";

const topPromptersCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('Returns top SoilAPT users.'),
  async execute(interaction) {
    await interaction.reply('Pong!')
  }
}

export default topPromptersCommand