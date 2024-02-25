import { type APIApplicationCommandOptionChoice, SlashCommandBuilder } from "discord.js"

import type { BotCommand } from '../types';
import fetchApi from "../helpers/fetch-api";
import type { Persona } from "../../api/data/persona";
import { log } from "kabum-ts-logger";

let retries = 3
let personas: Persona[] | undefined = undefined

do {
  personas = await fetchApi<Persona[]>('/api/personas/')
  if (personas !== undefined) break
  retries--
  if (retries > 0) {
    log.warn(`No persona returned. Retrying (${retries})`)
    await Bun.sleep(1500)
  }
} while (retries > 0)

if (!personas) {
  throw new Error('No personas returned! Is the API online?')
}

const personasChoices = personas.map((persona: Persona): APIApplicationCommandOptionChoice<number> => ({ name: persona.title, value: +persona.id }));

const choosePersonaCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName('choose-persona')
    .setDescription('Change which persona the bot will use')
    .addNumberOption(option =>
      option.setName('persona')
        .setDescription('The persona you want the bot to use')
        .setRequired(true)
        .addChoices(...personasChoices)
    ),
  async execute(interaction) {
    const selectedPersonaId = interaction.options.getNumber('persona');

    if (null === selectedPersonaId) {
      return;
    }

    await fetchApi<Persona>(`api/personas/change/${selectedPersonaId}`, {
      method: 'POST',
    })
    const persona = await fetchApi<Persona>('/api/personas/current')
    if (!persona) return

    await interaction.reply(`Ok, ma personnalité est maintenant ${persona.title} (ajouté par ${persona.author}).`)
  }
}

export default choosePersonaCommand
