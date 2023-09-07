import { BotCommand } from '../types.js'
import { SlashCommandBuilder } from "discord.js";

const userCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Returns Pong!'),
  async execute(interaction) {
    await interaction.reply('Pong!')
  }
}

export default userCommand