import { loadCommands } from './load-commands'
import { REST, Routes } from 'discord.js'

import { log } from './logger'

async function deployCommands() {
  const {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
    DISCORD_GUILD_ID
  } = Bun.env

  if (
    DISCORD_TOKEN === undefined ||
    DISCORD_CLIENT_ID === undefined ||
    DISCORD_GUILD_ID === undefined
  ) {
    log.error(`Missing environment variables, can't deploy.`)
    throw `Missing environment variables, can't deploy.`
  }

  const commands = await loadCommands()
  const deployables = commands.map(c => c.data.toJSON())

  const rest = new REST().setToken(DISCORD_TOKEN)

  try {
    console.log(`Deploying ${commands.length} commands.`)
    await rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
      { body: deployables }
    )

    console.log(`Deployment successful`)
  } catch (error) { log.error(error) }
}

deployCommands()