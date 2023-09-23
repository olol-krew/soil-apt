import { Router } from 'express'
import { db } from '../data/database'

const personaRouter = Router()

personaRouter.get('/', (req, res) => {
  const personas = db.persona.getAll()
  res.json(personas)
})

personaRouter.get('/:id', (req, res) => {
  const { id } = req.params
  const persona = db.persona.get(id)
  console.log(persona)
  res.json(persona)
})

personaRouter.post('/', (req, res) => {
  const { author, title, prompt } = req.body
  const persona = db.persona.create({ author, title, prompt })
  if (!persona) res.sendStatus(500)
  res.status(201).json(persona)
})

personaRouter.delete('/:id', (req, res) => {
  const { id } = req.params
  db.persona.delete(id)
  res.sendStatus(204)
})

personaRouter.put('/:id', (req, res) => {
  const { id } = req.params
  const { author, title, prompt } = req.body
  const oldUser = db.persona.get(id)
  if (!oldUser) res.sendStatus(404)
  const update = db.persona.update({ id, author, title, prompt })
  if (!update) res.sendStatus(500)
  res.json(update)
})

export default personaRouter