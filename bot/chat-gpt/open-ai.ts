import OpenAI from "openai"
import { Message } from 'discord.js'
import { APTClient } from "../types"
import { Persona } from "../../api/data/persona"

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function createContext(message: Message<boolean>, client: APTClient, persona: Persona): Promise<{ role: "function" | "user" | "system" | "assistant", content: string }[]> {
  const previously: Message[] = []
  const promptUser = message.author

  let currentMessage = message
  while (currentMessage.reference) {
    const reference = await currentMessage.fetchReference()
    previously.push(reference)
    currentMessage = reference
  }

  const systemMessages: { role: "function" | "user" | "system" | "assistant", content: string }[] = [
    {
      role: 'system',
      content: persona.prompt
    }, {
      role: 'system',
      content: `Ton nom est SoilAPT. Les gens t'appellent aussi <@${client.user?.id}> mais tu n'utilise absolument jamais ce nom pour parler de toi.`
    },
    {
      role: 'system',
      content: 'Réponds avec 100 mots maximum'
    }
  ]

  if (previously.length > 0) {
    for (const previousMessage of previously.reverse()) {
      const isAssistantPrompt = () => previousMessage.author.id === client.user?.id
      const isPromptUser = () => previousMessage.author.id === promptUser.id
      systemMessages.push({
        role: isAssistantPrompt() ? 'assistant' : isPromptUser() ? 'user' : 'system',
        content: isPromptUser()
          ? previousMessage.content :
          isAssistantPrompt() ? previousMessage.content : `<@${previousMessage.author.id}> a dit: ${previousMessage.content}`
      })
    }
  }

  return systemMessages
}