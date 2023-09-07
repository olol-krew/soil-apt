import { Message } from "discord.js";
import { APTClient } from "../types";
import { getSystemMessages, openai } from "./open-ai";
import { PrismaClient } from "@prisma/client";
import { appendFile } from "node:fs";

export async function handlePrompt(client: APTClient, message: Message, prisma: PrismaClient) {
  if (!message.content.startsWith(`<@${client.user.id}>`))
    return

  let originalMessage = null
  if (message.reference) {
    originalMessage = await message.fetchReference()
  }

  try {
    const chatResponse = await openai.chat.completions.create({
      messages: [
        ...await getSystemMessages(message, originalMessage),
        {
          role: 'user',
          content: message.content.replace(`<@${client.user.id}`, '')
        }
      ],
      temperature: 0.7,
      model: 'gpt-3.5-turbo',
    })

    const prompt = await prisma.prompt.create({
      data: {
        author: {
          connectOrCreate: {
            where: {
              id: message.author.id
            },
            create: {
              name: message.author.globalName || message.author.displayName,
              avatar: message.author.avatar,
              id: message.author.id
            }
          }
        },
        input: message.content,
        isResponse: originalMessage != null,
        responseTo: originalMessage && originalMessage.content,
        output: chatResponse.choices[0].message.content,
        inputToken: chatResponse.usage.prompt_tokens,
        outputToken: chatResponse.usage.completion_tokens,
        createdAt: new Date()
      }
    })

    console.log(prompt)
    message.reply(chatResponse.choices[0].message.content)

  } catch (error) {
    console.error(error)
    appendFile('errors.log', JSON.stringify(error), err => {
      if (err) throw err
    })
  }
}
