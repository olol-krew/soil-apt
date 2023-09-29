import { log } from "../../common/helpers/logger"

interface FetchApiOptions {
  method: "GET" | "POST" | "DELETE" | "PUT"
  body?: string
}

export default async function fetchApi<T>(endpoint: string, opts: FetchApiOptions = { method: 'GET' }): Promise<T | undefined> {
  log.info(`${opts.method} ${endpoint}`)
  const req = await fetch(`${Bun.env.API_HOST}:${Bun.env.API_PORT}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`, {
    headers: {
      'User-Agent': 'SoilAPT-bot',
      'Content-Type': 'application/json'
    },
    method: opts.method,
    body: opts.body && opts.body
  })

  if (req.status > 299) {
    log.error(`${req.status}: ${req.statusText}`)
    return
  }

  const output = await req.json() as T
  return output
}