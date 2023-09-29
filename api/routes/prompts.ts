import { Router } from "express";
import { db } from "../data/database";
import { log } from "../../common/helpers/logger";

const promptRouter = Router()

promptRouter.get('/', (req, res) => {
  let limit = req.query.limit && +req.query.limit
  let offset = req.query.offset && +req.query.offset

  if (!limit || limit > 100) limit = 100
  if (!offset) offset = undefined

  const prompts = db.prompt.getAll(limit, offset)
  return res.json(prompts)
})

export interface TopUser {
  totalToken: number;
  userId: string;
  inputTokenCount: number;
  outputTokenCount: number;
  promptCount: number;
  user: string | undefined
}

promptRouter.get('/top-users', (req, res) => {
  const promptCount = db.prompt.countPerUser()
  const users = db.promptUser.getAll()
  const topUsers = promptCount.map(count => {
    return {
      user: users.find(u => u.id === count.userId)?.name,
      ...count,
      totalToken: count.inputTokenCount + count.outputTokenCount
    }
  })
  if (!topUsers) return res.sendStatus(500)
  return res.json(topUsers)
})

promptRouter.get('/token-usage', (req, res) => {
  const tokenUsage = db.prompt.countUsageTokens()
  if (!tokenUsage) return res.sendStatus(500)
  return res.json(tokenUsage)
})

promptRouter.get('/:id', (req, res) => {
  const prompt = db.prompt.get(req.params.id)
  if (!prompt) return res.sendStatus(404)
  return res.json(prompt)
})

promptRouter.post('/', async (req, res) => {
  const { userId, isResponse, responseTo, inputToken, outputToken, input, output } = req.body
  try {
    const prompt = await db.prompt.create(userId, isResponse, responseTo, inputToken, outputToken, input, output)
    if (!prompt) return res.sendStatus(500)
    return res.json(prompt)
  } catch (err) {
    log.error(err)
    return res.sendStatus(500)
  }
})

export default promptRouter