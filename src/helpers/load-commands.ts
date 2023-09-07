import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { BotCommand } from '../types'

/**
 * @returns commands defined in the `commands` folder.
 */
export async function loadCommands() {
  const commandsPath = join(__dirname, '../commands')
  const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'))

  const commands: BotCommand[] = []

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file)
    console.log(`Importing ${filePath}`)
    const command: BotCommand = (await import(filePath)).default.default

    if ('data' in command && 'execute' in command) {
      commands.push(command)
    } else {
      console.error(`Command at ${filePath} is missing required keys.`)
    }
  }

  return commands
}