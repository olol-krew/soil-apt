import { Client, Events, GatewayIntentBits, Message, Collection } from 'discord.js'

import { APTClient } from './types'
import { loadCommands } from './helpers/load-commands'
import { handlePrompt } from './chat-gpt/prompt'
import { handleCommand } from './helpers/handle-commands'
import { log } from './helpers/logger'

const { DISCORD_TOKEN } = process.env

if (DISCORD_TOKEN === undefined) {
  log.error('No Discord token given')
  throw `A Discord bot token is necessary.`
}

async function run() {
  const client: APTClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  })

  client.commands = new Collection()
  const loadedCommands = await loadCommands()
  loadedCommands.map(c => client.commands?.set(c.data.name, c))

  client.on(Events.MessageCreate, async (message: Message) => handlePrompt(client, message))
  client.on(Events.InteractionCreate, async interaction => handleCommand(interaction))

  client.once(Events.ClientReady, c => {
    log.info(`Ready! Logged in as ${c.user.tag}`)
  })

  client.login(DISCORD_TOKEN)
}

run()
