import Database, { SQLQueryBindings } from "bun:sqlite"
import { Message } from "discord.js"
import { ChatCompletion } from "openai/resources/chat/index.mjs"

export interface Prompt {
  id: string
  userId: string
  isResponse: boolean
  responseTo: string
  inputToken: number
  outputToken: number
  createdAt: string
  input: string
  output: string
}

export interface PromptCount {
  userId: string
  inputTokenCount: number
  outputTokenCount: number
  promptCount: number
}

export default class PromptTable {
  db: Database

  constructor(db: Database) {
    this.db = db
    this.db.run(`CREATE TABLE IF NOT EXISTS Prompt(
      id text PRIMARY KEY NOT NULL,
      "userId" text NOT NULL,
      "isResponse" boolean NOT NULL,
      "responseTo" text,
      "inputToken" integer NOT NULL,
      "outputToken" integer NOT NULL,
      "createdAt" text,
      input text NOT NULL,
      output text NOT NULL
    );`)
  }

  get(id: string): Prompt | null {
    return this.db.query<Prompt, SQLQueryBindings>(`
      SELECT * FROM Prompt WHERE id=$id;
    `).get({
      $id: id
    })
  }

  async create(message: Message, chatResponse: ChatCompletion) {
    const responseTo = message.reference && await message.fetchReference()
    const promptParams = {
      $id: crypto.randomUUID(),
      $userId: message.author.id,
      $isResponse: message.reference !== null,
      $responseTo: responseTo && responseTo.content,
      $inputToken: chatResponse.usage?.prompt_tokens || null,
      $outputToken: chatResponse.usage?.completion_tokens || null,
      $createdAt: new Date().toISOString(),
      $input: message.content,
      $output: chatResponse.choices[0].message.content
    }

    this.db.query<Prompt, SQLQueryBindings>(`
      INSERT INTO Prompt (id, userId, isResponse, responseTo, inputToken, outputToken, createdAt, input, output)
      VALUES ($id, $userId, $isResponse, $responseTo, $inputToken, $outputToken, $createdAt, $input, $output);
    `).get(promptParams)

    return this.get(promptParams.$id)
  }

  countPerUser(limit: number = 10) {
    return this.db.query<PromptCount, SQLQueryBindings[]>(`
      SELECT 
          userId, 
          SUM(inputToken) as inputTokenCount, 
          SUM(outputToken) as outputTokenCount,
          COUNT(*) as promptCount
      FROM
          Prompt
      GROUP BY
          userId
      ORDER BY
          promptCount DESC
      LIMIT $limit;
    `).all({
      $limit: limit
    })
  }
}