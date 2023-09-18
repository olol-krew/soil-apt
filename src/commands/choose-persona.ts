import { APIApplicationCommandOptionChoice, SlashCommandBuilder } from "discord.js"

import { BotCommand } from '../types'
import { Persona } from "../data/persona"
import { db } from "../data/database"
import { forcePotdChange } from "../helpers/potd-helpers"

if (0 === db.persona.getCount()) {
    await db.persona.load()
}
const personasChoices = db.persona.getAll().map((persona: Persona): APIApplicationCommandOptionChoice<number> => ({name: persona.title, value: +persona.id }));

const choosePersonaCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName('choose-persona')
    .setDescription('Change which persona the bot will use')
    .addIntegerOption(option =>
      option.setName('persona')
        .setDescription('The persona you want the bot to use')
        .setRequired(true)
        .addChoices(...personasChoices)
    ),
  async execute(interaction) {
    const selectedPersonaId = interaction.options.getInteger('persona');

    if (null === selectedPersonaId) {
      return;
    }

    const selectedPersona = db.persona.get(selectedPersonaId);

    if (null === selectedPersona) {
        return;
    }

    forcePotdChange(selectedPersona);

    interaction.reply(`Je serai désormais ${selectedPersona.title} !`);
  }
}

export default choosePersonaCommand
