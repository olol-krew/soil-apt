/*eslint @typescript-eslint/no-explicit-any: ["error", { "ignoreRestArgs": true }]*/

import { BunFile, FileSink } from 'bun'
import chalk, { ChalkInstance } from 'chalk'

export interface LoggerOptions {
  level?: "debug" | "info" | "warn" | "error" | undefined
  logFile?: string | undefined
}

type LogLevel = "debug" | "info" | "warn" | "error"

const INFO_COLOR = chalk.blue
const WARN_COLOR = chalk.yellow
const ERROR_COLOR = chalk.red
const DEBUG_COLOR = chalk.cyan

class Logger {
  #level: LogLevel[]
  #logFile: PathLike | undefined
  #writer: FileSink | undefined

  constructor(options?: LoggerOptions) {
    this.#level = [
      "debug",
      "info",
      "warn",
      "error"
    ]

    for (let i = 0; i < this.#level.length; i++) {
      if (this.#level[i] !== (options?.level || 'info')) continue

      this.#level = this.#level.slice(i)
    }

    this.#logFile = options?.logFile
    this.#writer = this.#logFile ? Bun.file(this.#logFile).writer() : undefined
  }

  info(...args: any) {
    this.#log('info', INFO_COLOR, ...args)
  }

  warn(...args: any) {
    this.#log('warn', WARN_COLOR, ...args)
  }

  error(...args: any) {
    this.#log('error', ERROR_COLOR, ...args)
  }

  debug(...args: any) {
    this.#log('debug', DEBUG_COLOR, ...args)
  }

  #log(level: "debug" | "info" | "warn" | "error", color: ChalkInstance, ...content: any) {
    if (!this.#level.includes(level)) return

    if (this.#writer !== undefined) {
      this.#writer.write(this.#getLogString({ level }, ...content) + '\n')
      this.#writer.flush()
    }
    console.log(this.#getLogString({ level, color }, ...content))
  }

  #getTimeStamp(includeDate: boolean = true) {
    const time = new Date()
    return (includeDate ? this.#getDateString(time) + ' ' : '') + this.#getTimeString(time)
  }

  #getLogString(logOptions: { level: "debug" | "info" | "warn" | "error", color?: ChalkInstance }, ...content: any) {
    return logOptions.color
      ? `${this.#getTimeStamp()} ${logOptions.color(logOptions.level.toUpperCase())} - ${content.map((c: any) => typeof c === 'object' ? JSON.stringify(c) : c).join(' ')}`
      : `${this.#getTimeStamp()} ${logOptions.level.toUpperCase()} - ${content.map((c: any) => typeof c === 'object' ? JSON.stringify(c) : c).join(' ')}`
  }

  #getDateString(time: Date) {
    return `${time.getDate().toLocaleString('fr-FR', { minimumIntegerDigits: 2 })}-${time.getMonth().toLocaleString('fr-FR', { minimumIntegerDigits: 2 })}-${time.getFullYear()}`
  }

  #getTimeString(time: Date) {
    return `${time.getHours().toLocaleString('fr-FR', { minimumIntegerDigits: 2 })}:${time.getMinutes().toLocaleString('fr-FR', { minimumIntegerDigits: 2 })}:${time.getSeconds().toLocaleString('fr-FR', { minimumIntegerDigits: 2 })}.${time.getMilliseconds()}`
  }
}

export const log = new Logger({ logFile: Bun.env.NODE_ENV === 'PROD' ? `soilapt-${new Date().toISOString()}.log` : undefined })