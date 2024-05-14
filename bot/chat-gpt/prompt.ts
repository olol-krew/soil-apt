import { Message } from "discord.js";

import type { APTClient } from "../types";
import { createContext, openai } from "./open-ai";
import { log } from 'kabum-ts-logger'
import type { Persona } from "../../api/data/persona";
import fetchApi from "../helpers/fetch-api";

export async function handlePrompt(client: APTClient, message: Message) {
  if (!message.content.startsWith(`<@${client.user?.id}>`))
    return

  log.info(`Prompt received from ${message.author.displayName}.`)

  const persona = await fetchApi<Persona>('/api/personas/current')

  if (!persona) return

  try {
    const chatResponse = await openai.chat.completions.create({
      messages: [
        ...await createContext(message, client, persona),
        {
          role: 'user',
          content: message.content.replace(`<@${client.user?.id}> `, '')
        }
      ],
      temperature: 1.5,
      model: 'gpt-4o',
    })

    log.info(`Response from OpenAI received. Input token: ${chatResponse.usage?.prompt_tokens}, output token: ${chatResponse.usage?.completion_tokens}. Replying...`)
    message.reply(chatResponse.choices[0].message.content || `Désolé, il y a eu un problème avec la requête, contactez Nico.`)
  } catch (error) {
    log.error(error)
  }
}
