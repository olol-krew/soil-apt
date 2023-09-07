import 'dotenv/config'

import { loadCommands } from './load-commands.js'
import { REST, Routes } from 'discord.js'

const {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DISCORD_GUILD_ID
} = process.env

async function deployCommands() {
  const commands = await loadCommands()
  const deployables = commands.map(c => c.data.toJSON())

  const rest = new REST().setToken(DISCORD_TOKEN)

  try {
    console.log(`Deploying ${commands.length} commands.`)
    const data = await rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
      { body: deployables }
    )

    console.log(`Deployment successful`)
  } catch (error) { console.log(error) }
}

deployCommands()