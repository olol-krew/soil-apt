import { log } from "kabum-ts-logger"

interface FetchApiOptions {
  method: "GET" | "POST" | "DELETE" | "PUT"
  body?: string
}

export default async function fetchApi<T>(endpoint: string, opts: FetchApiOptions = { method: 'GET' }): Promise<T | undefined> {
  log.info(`${opts.method} ${endpoint}`)
  try {
    const req = await fetch(`http://${Bun.env.API_HOST}:${Bun.env.API_PORT || 3001}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`, {
      headers: {
        'User-Agent': 'SoilAPT-bot',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(Bun.env.BOT_TOKEN!)}`
      },
      method: opts.method,
      body: opts.body && opts.body
    })

    if (req.status > 299) {
      log.error(`${req.status}: ${req.statusText}`)
      return
    }

    log.success(`Status ${req.status}`)
    const output = await req.json() as T
    return output
  } catch (e) {
    log.error(e)
  }
}