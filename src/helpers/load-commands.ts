import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { BotCommand } from '../types'
import { log } from './logger'

/**
 * @returns commands defined in the `commands` folder.
 */
export async function loadCommands() {
  const commandsPath = join(__dirname, '../commands')
  let commandFiles = readdirSync(commandsPath)

  commandFiles = commandFiles.filter(file => file.endsWith('.ts'))

  const commands: BotCommand[] = []

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file)
    log.info(`Importing ${filePath}`)
    const command: BotCommand = (await import(filePath)).default

    if ('data' in command && 'execute' in command) {
      commands.push(command)
    } else {
      log.error(`Command at ${filePath} is missing required keys.`)
    }
  }

  return commands
}