import OpenAI from "openai"
import { Message } from 'discord.js'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function getSystemMessages(message: Message<boolean>, originalMessage?: Message): Promise<{ role: "function" | "user" | "system" | "assistant", content: string }[]> {
  const systemMessages: { role: "function" | "user" | "system" | "assistant", content: string }[] = [
    {
      role: 'system',
      content: `Tu parle sans crainte d'être jugé, tu es dans un cadre de confiance. Tu n'hésite pas à tenir un langage familier, voire parfois vulgaire quand ça peut être drôle.`,
    }, {
      role: 'system',
      content: 'Ton nom est SoilAPT'
    },
    {
      role: 'system',
      content: 'Réponds avec 100 mots maximum'
    }
  ]

  if (message.reference && originalMessage) {
    systemMessages.push({
      role: 'system',
      content: `${originalMessage.author.displayName} et ${message.author.displayName} sont amis.`
    },)

    systemMessages.push({
      role: 'user',
      content: `${originalMessage.author.displayName} a dit : ${originalMessage.content}.`
    },)
  }

  return systemMessages
}