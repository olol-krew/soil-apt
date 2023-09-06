import 'dotenv/config'
import { appendFile } from 'fs'

import { Client, Events, GatewayIntentBits, Message } from 'discord.js'
import { openai, getSystemMessages } from './config/open-ai'

const { DISCORD_TOKEN } = process.env

if (DISCORD_TOKEN === undefined) throw `A Discord bot token is necessary.`

async function run() {
  let client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent
    ]
  })

  client.on(Events.MessageCreate, async (message: Message) => {
    if (!message.content.includes(client.user.id))
      return


    try {
      const chatResponse = await openai.chat.completions.create({
        messages: [
          ...await getSystemMessages(message),
          {
            role: 'user',
            content: message.content.replace(`<@${client.user.id}`, '').replace('@', '')
          }
        ],
        temperature: 0.7,
        model: 'gpt-3.5-turbo',
      })
      console.log(`${message.author.displayName}: ${chatResponse.usage.total_tokens} total tokens`)

      message.reference
        ? (await message.fetchReference()).reply(chatResponse.choices[0].message.content)
        : message.reply(chatResponse.choices[0].message.content)

    } catch (error) {
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