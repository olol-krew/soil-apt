import OpenAI from "openai"
import { Message } from 'discord.js'
import type { APTClient } from "../types"
import type { Persona } from '../../api/database/persona'
import type { ChatMessage, ChatMessageContent } from '../types'

interface OpenAiOptions {
  temperature: number
  vision_enabled?: boolean
  max_tokens?: number
}

class OpenAi {
  temperature: number
  max_tokens?: number
  model: string
  token: string
  openai: OpenAI
  vision_enabled: boolean

  constructor(
    token: string,
    model: string,
    options: OpenAiOptions = {
      temperature: 0.5,
      vision_enabled: true,
    }
  ) {
    this.model = model
    this.token = token
    this.temperature = options.temperature
    this.max_tokens = options.max_tokens
    this.vision_enabled =
      options.vision_enabled === undefined ? true : options.vision_enabled
    this.openai = new OpenAI({
      apiKey: this.token,
    })
  }

  createChatMessage(
    message: Message<boolean>,
    role: 'user' | 'system' | 'assistant'
  ): ChatMessage {
    const content: ChatMessageContent[] = [
      {
        type: 'text',
        text:
          role === 'user'
            ? message.content
            : role === 'assistant'
            ? message.content
            : `<@${message.author.id}> a dit: ${message.content}`,
      },
    ]

    if (message.attachments.size > 0 && this.vision_enabled) {
      for (const attachementArray of message.attachments) {
        const attachment = attachementArray[1]
        if (attachment.contentType?.startsWith('image/'))
          content.push({
            type: 'image_url',
            image_url: { url: attachment.url },
          })
      }
    }

    return {
      role,
      content,
    }
  }

  async getContextFromDiscord(
    message: Message<boolean>,
    client: APTClient,
    persona: Persona
  ): Promise<ChatMessage[]> {
    const previously: Message[] = []
    const promptUser = message.author

    let currentMessage = message
    while (currentMessage.reference) {
      const reference = await currentMessage.fetchReference()
      previously.push(reference)
      currentMessage = reference
    }

    const systemMessages: ChatMessage[] = [
      {
        role: 'system',
        content: [{ type: 'text', text: persona.prompt }],
      },
      {
        role: 'system',
        content: [
          {
            type: 'text',
            text: `Ton nom est SoilAPT. Les gens t'appellent aussi <@${client.user?.id}> mais tu n'utilise absolument jamais ce nom pour parler de toi.`,
          },
        ],
      },
    ]

    if (previously.length > 0) {
      for (const previousMessage of previously.reverse()) {
        const isAssistantPrompt = () =>
          previousMessage.author.id === client.user?.id
        const isPromptUser = () => previousMessage.author.id === promptUser.id

        const role = isAssistantPrompt()
          ? 'assistant'
          : isPromptUser()
          ? 'user'
          : 'system'

        systemMessages.push(this.createChatMessage(previousMessage, role))
      }
    }

    return systemMessages
  }

  async createChatCompletion(
    message: Message<boolean>,
    client: APTClient,
    persona: Persona
  ) {
    const prompt = this.createChatMessage(message, 'user')

    return await this.openai.chat.completions.create({
      messages: [
        ...(await this.getContextFromDiscord(message, client, persona)),
        prompt,
      ],
      temperature: this.temperature,
      max_tokens: this.max_tokens,
      model: this.model,
    })
  }
}

if (Bun.env.OPENAI_API_KEY === undefined)
  throw `No OPENAI_API_KEY was found in the environment.`

export const openai = new OpenAi(Bun.env.OPENAI_API_KEY, 'gpt-4o', {
  temperature: 0.8,
  max_tokens: 300,
  vision_enabled:
    Bun.env.VISION_ENABLED === undefined || Bun.env.VISION_ENABLED === 'true',
})