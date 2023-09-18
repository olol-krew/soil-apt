import { Client, Events, GatewayIntentBits, Message, Collection } from 'discord.js'
import { CronJob } from 'cron'

import { APTClient } from './types'
import { loadCommands } from './helpers/load-commands'
import { handlePrompt } from './chat-gpt/prompt'
import { handleCommand } from './helpers/handle-commands'
import { log } from './helpers/logger'
import { db } from './data/database'
import { forcePotdChange, loadPotd, pickNewPotd } from './helpers/potd-helpers'
import parseArgs from './helpers/arg-parser'

const { DISCORD_TOKEN } = process.env

if (DISCORD_TOKEN === undefined) {
  log.error('No Discord token given')
  throw `A Discord bot token is necessary.`
}

if (Bun.env.DISCORD_GUILD_ID === undefined) {
  log.warn(`DISCORD_GUILD_ID is not defined your environment or .env* file. This is not critical for the bot to work but you won't be able to deploy the commands if they're not on your target server.`)
}

const args = parseArgs()

async function run() {
  const client: APTClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  })

  log.info('Loading personas...')
  const personaCount = await db.persona.load()

  if (personaCount === 0) {
    log.error('The list of persona is missing from the expected folder (src/data/personas.yml)')
    throw `No persona found`
  }

  log.info(`Loaded ${personaCount} personas for the bot.`)

  client.commands = new Collection()
  const loadedCommands = await loadCommands()
  loadedCommands.map(c => client.commands?.set(c.data.name, c))

  const potdJob = new CronJob('0 0 * * *', () => {
    log.info(`Picking a new persona of the day`)
    const currentPotd = db.potd.getMostRecent()
    let newPotd = pickNewPotd()

    while (newPotd!.personaId === currentPotd!.personaId || !db.persona.get(newPotd!.personaId)) {
      log.warn(`Invalid persona ID ${newPotd?.personaId}, new attempt.`)
      newPotd = pickNewPotd()
    }

    const persona = db.persona.get(newPotd!.personaId)
    log.info(`New POTD is ${db.persona.get(newPotd!.personaId)?.title}`)
    forcePotdChange(persona!)
  }, null, false, 'Europe/Paris')
  potdJob.start()

  client.on(Events.MessageCreate, async (message: Message) => handlePrompt(client, message, loadPotd({ forcePersonaId: args.forcePersona })))
  client.on(Events.InteractionCreate, async interaction => handleCommand(interaction))

  client.once(Events.ClientReady, c => {
    log.info(`Ready! Logged in as ${c.user.tag}`)
  })

  client.login(DISCORD_TOKEN)
}

run()
