import { Message } from "discord.js";

import { APTClient } from "../types";
import { createContext, openai } from "./open-ai";

import { db } from "../data/database";
import { log } from "../helpers/logger";
import { Persona } from "../data/persona";
import { loadPotd } from "../helpers/potd-helpers";

export async function handlePrompt(client: APTClient, message: Message) {
  if (!message.content.startsWith(`<@${client.user?.id}>`))
    return

  const mostRecentPotd = db.potd.getMostRecent()
  const persona = null !== mostRecentPotd ? db.persona.get(mostRecentPotd.personaId) : loadPotd();

  log.info(`Prompt received from ${message.author.displayName}.`)

  try {
    const chatResponse = await openai.chat.completions.create({
      messages: [
        ...await createContext(message, client, persona!),
        {
          role: 'user',
          content: message.content.replace(`<@${client.user?.id}> `, '')
        }
      ],
      temperature: 0.7,
      model: 'gpt-3.5-turbo',
    })

    const user = db.user.get(message.author.id)
    if (!user) db.user.create(message.author)

    const prompt = await db.prompt.create(message, chatResponse)

    log.info(`Response from OpenAI received. Input token: ${prompt?.inputToken}, output token: ${prompt?.outputToken}. Replying...`)
    message.reply(chatResponse.choices[0].message.content || `Désolé, il y a eu un problème avec la requête, contactez Nico.`)
  } catch (error) {
    log.error(error)
  }
}
