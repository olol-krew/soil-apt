import { Router } from "express";
import { db } from "../data/database";

const promptRouter = Router()

promptRouter.get('/', (req, res) => {
  let limit = req.query.limit && +req.query.limit
  let offset = req.query.offset && +req.query.offset

  if (!limit || limit > 100) limit = 100
  if (!offset) offset = undefined

  const prompts = db.prompt.getAll(limit, offset)
  return res.json(prompts)
})

promptRouter.get('/:id', (req, res) => {
  const prompt = db.prompt.get(req.params.id)
  if (!prompt) return res.sendStatus(404)
  return res.json(prompt)
})

promptRouter.get('/usercount', (req, res) => {
  const promptCount = db.prompt.countPerUser()
  if (!promptCount) return res.sendStatus(500)
  return res.json(promptCount)
})

promptRouter.get('/tokenusage', (req, res) => {
  const tokenUsage = db.prompt.countUsageTokens()
  if (!tokenUsage) return res.sendStatus(500)
  return res.json(tokenUsage)
})

export default promptRouter