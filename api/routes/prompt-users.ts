import { Router } from "express";
import { db } from "../data/database";

const promptUserRouter = Router()

// route is for the bot only, prompt users are for internal use
promptUserRouter.use((req, res, next) => {
  if (req.ip !== Bun.env.BOT_IP && req.get('User-Agent') !== 'SoilAPT-bot') return res.sendStatus(403)
  next()
})

promptUserRouter.get('/', (req, res) => {
  const promptUsers = db.promptUser.getAll()
  if (promptUsers.length === 0) return res.sendStatus(404)
  return res.json(promptUsers)
})

promptUserRouter.get('/:id', (req, res) => {
  const { id } = req.params
  const promptUser = db.promptUser.get(id)
  if (!promptUser) return res.sendStatus(404)
  return res.json(promptUser)
})

promptUserRouter.post('/', (req, res) => {
  const { id, name, avatar } = req.body
  if (typeof id !== 'string' || typeof name !== 'string') return res.sendStatus(400)
  const newUser = db.promptUser.create({ id, name, avatar })
  if (!newUser) return res.sendStatus(500)
  return res.json(newUser)
})

promptUserRouter.put('/:id', (req, res) => {
  const { id } = req.params
  const { name, avatar } = req.body

  if (typeof name !== 'string') return res.sendStatus(400)

  const oldUser = db.promptUser.get(id)
  if (!oldUser) return res.sendStatus(404)

  const newUser = db.promptUser.update({ id, name, avatar })
  if (!newUser) return res.sendStatus(500)

  return res.json(newUser)
})

promptUserRouter.delete('/:id', (req, res) => {
  const { id } = req.params
  const user = db.promptUser.get(id)

  if (!user) return res.sendStatus(404)
  db.promptUser.delete(id)
  return res.sendStatus(204)
})

export default promptUserRouter

