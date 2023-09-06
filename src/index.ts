import 'dotenv/config'
import { appendFile } from 'fs'

import { Client, Events, GatewayIntentBits, Message } from 'discord.js'
import { openai, getSystemMessages } from './config/open-ai'
import { PrismaClient } from '@prisma/client'

const { DISCORD_TOKEN } = process.env

if (DISCORD_TOKEN === undefined) throw `A Discord bot token is necessary.`

async function run() {
  let client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  })

  const prisma = new PrismaClient()

  client.on(Events.MessageCreate, async (message: Message) => {
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

      message.reference
        ? (await message.fetchReference()).reply(chatResponse.choices[0].message.content)
        : message.reply(chatResponse.choices[0].message.content)

    } catch (error) {
      console.error(error)
      appendFile('errors.log', JSON.stringify(error), err => {
        if (err) throw err
      })
    }
  })

  client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`)
  })

  client.login(DISCORD_TOKEN)
}

run()