import { SlashCommandBuilder, Client, Collection, ChatInputCommandInteraction } from "discord.js"

export interface BotCommand {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}

export interface APTClient extends Client {
  commands?: Collection<string, BotCommand>
}