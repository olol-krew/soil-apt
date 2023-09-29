import { BaseInteraction } from "discord.js";
import { APTClient } from "../types";

import { log } from "../../common/helpers/logger";

export async function handleCommand(interaction: BaseInteraction) {
  if (!interaction.isChatInputCommand()) return

  const command = (interaction.client as APTClient).commands?.get(interaction.commandName)

  if (!command) {
    log.error(`No command matching ${interaction.commandName} was found.`)
    return
  }

  try {
    log.info(`Using command ${interaction.commandName}. Triggered by ${interaction.user.displayName}.`)
    await command.execute(interaction);
  } catch (error) {
    log.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
}