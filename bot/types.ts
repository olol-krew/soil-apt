import { SlashCommandBuilder, Client, Collection, ChatInputCommandInteraction } from "discord.js"

export interface BotCommand {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}

export interface APTClient extends Client {
  commands?: Collection<string, BotCommand>
}

export interface ChatMessageContent {
  type: 'text' | 'image_url'
  text?: string
  image_url?: {
    url: string
  }
}

export interface ChatMessage {
  role: 'user' | 'system' | 'assistant'
  content: ChatMessageContent[]
}

