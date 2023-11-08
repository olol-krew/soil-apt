import { Message } from "discord.js";

import { APTClient } from "../types";
import { createContext, openai } from "./open-ai";
import { log } from "../../common/helpers/logger";
import { Persona } from "../../api/data/persona";
import fetchApi from "../helpers/fetch-api";
import { Prompt } from "../../api/data/prompt";
import { PromptUser } from "../../api/data/prompt-user";

export async function handlePrompt(client: APTClient, message: Message) {
  if (!message.content.startsWith(`<@${client.user?.id}>`))
    return

  log.info(`Prompt received from ${message.author.displayName}.`)

  const [persona, dbUser] = await Promise.all([
    fetchApi<Persona>('/api/personas/today'),
    fetchApi<PromptUser>(`/api/prompt-users/${message.author.id}`)
  ])

  if (!persona) return
  if (!dbUser) {
    await fetchApi<PromptUser>('/api/prompt-users', {
      method: "POST",
      body: JSON.stringify({
        id: message.author.id,
        name: message.author.username,
        avatar: message.author.avatar
      })
    })
  }

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
      model: 'gpt-4-1106-preview',
    })

    const promptParams = {
      userId: message.author.id,
      isResponse: message.reference !== null,
      responseTo: message.reference && (await message.fetchReference()).content,
      inputToken: chatResponse.usage?.prompt_tokens,
      outputToken: chatResponse.usage?.completion_tokens,
      input: message.content,
      output: chatResponse.choices[0].message.content
    }

    const prompt = await fetchApi<Prompt>('/api/prompts/', {
      method: "POST",
      body: JSON.stringify(promptParams)
    })

    if (!prompt) {
      log.error(`There was an issue when creating the prompt for the DB.`)
      return
    }

    log.info(`Response from OpenAI received. Input token: ${prompt.inputToken}, output token: ${prompt.outputToken}. Replying...`)
    message.reply(chatResponse.choices[0].message.content || `Désolé, il y a eu un problème avec la requête, contactez Nico.`)
  } catch (error) {
    log.error(error)
  }
}
