import { log } from "../../common/helpers/logger"

export default async function fetchApi<T>(endpoint: string): Promise<T | undefined> {
  const req = await fetch(`${Bun.env.API_HOST}:${Bun.env.API_PORT}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`, {
    headers: { 'User-Agent': 'SoilAPT-bot' }
  })

  if (req.status > 299) {
    log.error(`${req.status}: ${req.statusText}`)
    return
  }

  const output = await req.json() as T
  return output
}