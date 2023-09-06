import 'dotenv/config'
import OpenAI from "openai"
import { Message } from 'discord.js'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function getSystemMessages(message: Message): Promise<{ role: "function" | "user" | "system" | "assistant", content: string }[]> {
  const systemMessages: { role: "function" | "user" | "system" | "assistant", content: string }[] = [
    {
      role: 'system',
      content: `Je veux que tu comporte comme un ami à qui on demande un service. Je veux aussi que tu fasse des réponses de moins de 100 mots.`,
    }, {
      role: 'system',
      content: 'Dans cette application ton nom est SoilAPT'
    },
  ]

  if (message.reference) {
    const originalMessage = await message.fetchReference()
    systemMessages.push({
      role: 'system',
      content: `Tu répondras en sachant que l'utilisateur, ${message.author.displayName} a un ami qui s'appelle ${originalMessage.author.displayName}. ${message.author.displayName} vient te voir après que ${originalMessage.author.displayName} a dit "${originalMessage.content}".`
    },)
  }

  return systemMessages
}