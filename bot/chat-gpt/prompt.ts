import { Message } from "discord.js";

import { APTClient } from "../types";
import { createContext, openai } from "./open-ai";

import { db } from "../../api/data/database";
import { log } from "../../common/helpers/logger";
import { Persona } from "../../api/data/persona";

export async function handlePrompt(client: APTClient, message: Message, persona: Persona) {
  if (!message.content.startsWith(`<@${client.user?.id}>`))
    return

  log.info(`Prompt received from ${message.author.displayName}.`)

  try {
    const chatResponse = await openai.chat.completions.create({
      messages: [
        ...await createContext(message, client, persona),
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
