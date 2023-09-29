import { APIApplicationCommandOptionChoice, SlashCommandBuilder } from "discord.js"

import { BotCommand } from '../types'
import fetchApi from "../helpers/fetch-api";
import { Persona } from "../../api/data/persona";

const personas = await fetchApi<Persona[]>('/api/personas/')
if (!personas) {
  throw new Error('No personas returned! Is the API online?')
}

const personasChoices = personas.map((persona: Persona): APIApplicationCommandOptionChoice<string> => ({ name: persona.title, value: persona.id }));

const choosePersonaCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName('choose-persona')
    .setDescription('Change which persona the bot will use')
    .addStringOption(option =>
      option.setName('persona')
        .setDescription('The persona you want the bot to use')
        .setRequired(true)
        .addChoices(...personasChoices)
    ),
  async execute(interaction) {
    const selectedPersonaId = interaction.options.getString('persona');

    if (null === selectedPersonaId) {
      return;
    }

    const selectedPersona = await fetchApi<Persona>('api/potd', {
      method: 'POST',
      body: JSON.stringify({
        personaId: selectedPersonaId
      })
    })

    if (undefined === selectedPersona) {
      return;
    }

    interaction.reply(`Je serai désormais ${selectedPersona.title} !`);
  }
}

export default choosePersonaCommand
