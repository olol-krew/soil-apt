import { Client, Events, GatewayIntentBits, Message, Collection } from 'discord.js'
import { CronJob } from 'cron'

import { APTClient } from './types'
import { loadCommands } from './helpers/load-commands'
import { handlePrompt } from './chat-gpt/prompt'
import { handleCommand } from './helpers/handle-commands'
import { log } from './helpers/logger'
import { db } from './data/database'
import pickNewPotd from './helpers/pick-new-potd'
import isToday from './helpers/is-today'
import { DateTime } from 'luxon'

const { DISCORD_TOKEN } = process.env

if (DISCORD_TOKEN === undefined) {
  log.error('No Discord token given')
  throw `A Discord bot token is necessary.`
}

if (Bun.env.DISCORD_GUILD_ID === undefined) {
  log.warn(`DISCORD_GUILD_ID is not defined your environment or .env* file. This is not critical for the bot to work but you won't be able to deploy the commands if they're not on your target server.`)
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

  log.info('Loading personas...')
  const personaCount = await db.persona.load()

  if (personaCount === 0) {
    log.error('The list of persona is missing from the expected folder (src/data/personas.yml)')
    throw `No persona found`
  }

  log.info(`Loaded ${personaCount} personas for the bot.`)

  let potd = db.potd.getMostRecent()
  if (!potd) {
    log.info('POTD database is empty, picking a new one...')
    potd = pickNewPotd()
  } else if (!isToday(DateTime.fromISO(potd.datePicked))) {
    log.info('POTD has expired, picking a new one')
    potd = pickNewPotd()
  } else log.info(`POTD is already defined`)
  log.info(`POTD is ${db.persona.get(potd!.personaId)?.title}`)

  const potdJob = new CronJob('0 0 * * *', () => {
    log.info(`Picking a new persona of the day`)
    const currentPotd = db.potd.getMostRecent()
    let newPotd = pickNewPotd()

    while (newPotd!.personaId === currentPotd!.personaId) {
      log.warn(`Picked persona ID ${newPotd?.personaId} again, new attempt.`)
      newPotd = pickNewPotd()
    }
    log.info(`New POTD is ${db.persona.get(newPotd!.personaId)?.title}`)
  }, null, false, 'Europe/Paris')
  potdJob.start()

  client.on(Events.MessageCreate, async (message: Message) => handlePrompt(client, message))
  client.on(Events.InteractionCreate, async interaction => handleCommand(interaction))

  client.once(Events.ClientReady, c => {
    log.info(`Ready! Logged in as ${c.user.tag}`)
  })

  client.login(DISCORD_TOKEN)
}

run()
