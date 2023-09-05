import 'dotenv/config'
import { appendFile } from 'fs'

import { Client, Events, GatewayIntentBits, Message } from 'discord.js'
import { openai } from './config/open-ai.js'

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
    if (!message.mentions.users.has(client.user.id))
      return


    try {
      if (message.reference) {
        const originalMessage = await message.fetchReference()
        const chatResponse = await openai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `Je veux que tu comporte comme un ami à qui on demande un service. Je veux aussi que tu fasse des réponses de moins de 100 mots. Tu répondras en sachant que l'utilisateur, ${message.author.displayName} a un ami qui s'appelle ${originalMessage.author.displayName}. ${message.author.displayName} vient te voir après que ${originalMessage.author.displayName} a dit "${originalMessage.content}".`,
            },
            {
              role: 'user',
              content: message.content.replace(`<@${client.user.id}`, '')
            }
          ],
          model: 'gpt-3.5-turbo'
        })

        originalMessage.reply(chatResponse.choices[0].message.content)
      } else {
        const chatResponse = await openai.chat.completions.create({
          messages: [
            {
              role: 'user',
              content: message.content.replace(`<@${client.user.id}`, '')
            }
          ],
          model: 'gpt-3.5-turbo'
        })

        message.reply(chatResponse.choices[0].message.content)
      }
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